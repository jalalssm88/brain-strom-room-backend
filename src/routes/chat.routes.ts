import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { listChatMessagesValidation } from '../validations/chat.validation';
import { validate } from '../middlewares/validate';
import { requireWorkspaceMember } from '../middlewares/requireWorkspaceRole';

const router = Router({ mergeParams: true });

router.get(
  '/',
  validate(listChatMessagesValidation),
  requireWorkspaceMember,
  chatController.listMessages,
);

export default router;
