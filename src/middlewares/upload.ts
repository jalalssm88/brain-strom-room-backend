import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { BadRequestError } from '../errors/AppError';
import {
  ALLOWED_AVATAR_EXTENSIONS,
  AVATARS_DIR,
  AVATARS_PUBLIC_PREFIX,
  MAX_AVATAR_FILE_BYTES,
  UPLOADS_ROOT,
} from '../constants/uploads';

fs.mkdirSync(AVATARS_DIR, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATARS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = (ALLOWED_AVATAR_EXTENSIONS as readonly string[]).includes(ext)
      ? ext
      : '.jpg';
    cb(null, `${randomUUID()}${safeExt}`);
  },
});

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new BadRequestError('Only image files are allowed'));
    return;
  }
  cb(null, true);
};

/** Multipart field name: `avatar` */
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: MAX_AVATAR_FILE_BYTES },
  fileFilter: imageFilter,
}).single('avatar');

export const toAvatarPublicPath = (filename: string): string =>
  `${AVATARS_PUBLIC_PREFIX}/${filename}`;

export const isLocalAvatarPath = (avatar: string | null | undefined): boolean =>
  Boolean(avatar?.startsWith(`${AVATARS_PUBLIC_PREFIX}/`));

export const deleteLocalAvatar = (avatar: string | null | undefined): void => {
  if (!isLocalAvatarPath(avatar) || !avatar) return;

  const relative = avatar.replace(/^\//, '');
  const fullPath = path.resolve(process.cwd(), relative);

  if (!fullPath.startsWith(UPLOADS_ROOT)) return;

  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch {
    // Best-effort cleanup; do not fail the request if unlink fails.
  }
};
