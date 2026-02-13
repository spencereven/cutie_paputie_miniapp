const fs = require('node:fs/promises');
const fsNative = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { recordAdminAction } = require('../services/admin-action-log.service');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const MIME_BY_EXT = {
  '.pdf': 'application/pdf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.txt': 'text/plain'
};

const EXT_BY_MIME = {
  'application/pdf': '.pdf',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/mp4': '.m4a',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'text/plain': '.txt'
};

function isTeacherOrAdmin(role) {
  return role === 'TEACHER' || role === 'ADMIN';
}

function getSafeBaseName(filename) {
  const base = path.basename(String(filename || 'upload'));
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'upload';
}

function resolveMimeType(filename, fallbackMime) {
  if (fallbackMime && typeof fallbackMime === 'string' && fallbackMime.trim()) return fallbackMime.trim();
  const ext = path.extname(filename).toLowerCase();
  return MIME_BY_EXT[ext] || 'application/octet-stream';
}

function resolveExtension(filename, mimeType) {
  const existingExt = path.extname(filename).toLowerCase();
  if (existingExt) return existingExt;
  return EXT_BY_MIME[mimeType] || '.bin';
}

function parseBase64Payload(input) {
  const text = String(input || '').trim();
  if (!text) return null;

  const marker = ';base64,';
  const markerIndex = text.indexOf(marker);
  if (text.startsWith('data:') && markerIndex > -1) {
    return {
      mimeType: text.slice(5, markerIndex),
      base64: text.slice(markerIndex + marker.length)
    };
  }

  return {
    mimeType: '',
    base64: text
  };
}

function detectContentTypeByName(filename) {
  const ext = path.extname(filename).toLowerCase();
  return MIME_BY_EXT[ext] || 'application/octet-stream';
}

async function uploadsRoutes(fastify) {
  const maxUploadBytes = fastify.env.UPLOAD_MAX_BYTES;
  const maxUploadMb = fastify.env.UPLOAD_MAX_MB;

  fastify.get('/uploads/limits', { preHandler: [fastify.authenticate] }, async () => ({
    code: 0,
    message: 'ok',
    data: {
      maxUploadBytes,
      maxUploadMB: maxUploadMb
    }
  }));

  fastify.get('/uploads/:filename', async (request, reply) => {
    const raw = String(request.params.filename || '');
    const safe = path.basename(raw);
    if (!safe || safe !== raw) {
      return reply.code(400).send({
        code: 40200,
        message: 'invalid_filename',
        data: null
      });
    }

    const filePath = path.join(UPLOAD_DIR, safe);
    try {
      const stat = await fs.stat(filePath);
      const total = Number(stat.size || 0);
      const contentType = detectContentTypeByName(safe);
      const range = String(request.headers.range || '').trim();

      reply.header('Accept-Ranges', 'bytes');
      reply.type(contentType);

      if (!range) {
        reply.header('Content-Length', String(total));
        return reply.send(fsNative.createReadStream(filePath));
      }

      const matched = /^bytes=(\d*)-(\d*)$/i.exec(range);
      if (!matched) {
        reply.header('Content-Range', `bytes */${total}`);
        return reply.code(416).send();
      }

      const startRaw = matched[1];
      const endRaw = matched[2];
      let start = startRaw ? Number.parseInt(startRaw, 10) : 0;
      let end = endRaw ? Number.parseInt(endRaw, 10) : (total - 1);

      if (Number.isNaN(start) || start < 0) start = 0;
      if (Number.isNaN(end) || end < start) end = total - 1;
      if (end >= total) end = total - 1;
      if (start >= total) {
        reply.header('Content-Range', `bytes */${total}`);
        return reply.code(416).send();
      }

      const chunkSize = end - start + 1;
      reply.code(206);
      reply.header('Content-Range', `bytes ${start}-${end}/${total}`);
      reply.header('Content-Length', String(chunkSize));
      return reply.send(fsNative.createReadStream(filePath, { start, end }));
    } catch (err) {
      return reply.code(404).send({
        code: 40201,
        message: 'file_not_found',
        data: null
      });
    }
  });

  fastify.post('/uploads/base64', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: {
        id: String(request.user.uid)
      }
    });
    if (!user) {
      return reply.code(404).send({
        code: 40020,
        message: 'user_not_found',
        data: null
      });
    }
    if (!isTeacherOrAdmin(user.role)) {
      return reply.code(403).send({
        code: 40202,
        message: 'forbidden_upload',
        data: null
      });
    }

    const { filename, contentBase64, mimeType } = request.body || {};
    const safeBase = getSafeBaseName(filename);
    const parsed = parseBase64Payload(contentBase64);
    if (!parsed || !parsed.base64) {
      return reply.code(400).send({
        code: 40203,
        message: 'content_base64_required',
        data: null
      });
    }

    let buffer;
    try {
      buffer = Buffer.from(parsed.base64, 'base64');
    } catch (err) {
      return reply.code(400).send({
        code: 40204,
        message: 'invalid_base64_content',
        data: null
      });
    }

    if (!buffer || buffer.length === 0) {
      return reply.code(400).send({
        code: 40204,
        message: 'invalid_base64_content',
        data: null
      });
    }
    if (buffer.length > maxUploadBytes) {
      return reply.code(413).send({
        code: 40205,
        message: 'file_too_large',
        data: {
          maxUploadBytes,
          maxUploadMB: maxUploadMb
        }
      });
    }

    const finalMimeType = resolveMimeType(safeBase, mimeType || parsed.mimeType);
    const finalExt = resolveExtension(safeBase, finalMimeType);
    const storedName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${finalExt}`;
    const filePath = path.join(UPLOAD_DIR, storedName);

    await fs.mkdir(UPLOAD_DIR, {
      recursive: true
    });
    await fs.writeFile(filePath, buffer);

    await recordAdminAction(fastify, {
      actorUserId: user.id,
      actorRole: user.role,
      action: 'upload_file',
      targetType: 'upload',
      targetId: storedName,
      detail: {
        mimeType: finalMimeType,
        size: buffer.length,
        originalFilename: safeBase
      }
    });

    return {
      code: 0,
      message: 'ok',
      data: {
        filename: storedName,
        originalFilename: safeBase,
        url: `/api/v1/uploads/${storedName}`,
        mimeType: finalMimeType,
        size: buffer.length
      }
    };
  });
}

module.exports = uploadsRoutes;
