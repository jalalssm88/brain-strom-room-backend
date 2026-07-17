import path from 'path';

export const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');
export const AVATARS_DIR = path.join(UPLOADS_ROOT, 'avatars');
export const AVATARS_PUBLIC_PREFIX = '/uploads/avatars';
export const MAX_AVATAR_FILE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_AVATAR_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'] as const;
