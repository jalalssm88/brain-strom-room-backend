import multer from 'multer';

/**
 * File upload middleware shell — not used in v1 (README out of scope).
 * Configure storage limits when file uploads are added.
 */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
