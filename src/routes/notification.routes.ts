import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { notificationIdValidation } from '../validations/notification.validation';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.list);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', validate(notificationIdValidation), notificationController.markAsRead);

export default router;
