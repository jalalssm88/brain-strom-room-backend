import { Router } from 'express';
import { MemberRole } from '../prisma';
import { commentController } from '../controllers/comment.controller';
import {
  listCommentsValidation,
  createCommentValidation,
  updateCommentValidation,
  commentIdParamValidation,
} from '../validations/comment.validation';
import { validate } from '../middlewares/validate';
import {
  requireWorkspaceMember,
  requireWorkspaceRole,
} from '../middlewares/requireWorkspaceRole';

const router = Router({ mergeParams: true });

router.get(
  '/',
  validate(listCommentsValidation),
  requireWorkspaceMember,
  commentController.listComments,
);

router.post(
  '/',
  validate(createCommentValidation),
  requireWorkspaceRole(MemberRole.ADMIN, MemberRole.EDITOR),
  commentController.createComment,
);

router.patch(
  '/:commentId',
  validate(updateCommentValidation),
  requireWorkspaceRole(MemberRole.ADMIN, MemberRole.EDITOR),
  commentController.updateComment,
);

router.delete(
  '/:commentId',
  validate(commentIdParamValidation),
  requireWorkspaceRole(MemberRole.ADMIN, MemberRole.EDITOR),
  commentController.deleteComment,
);

export default router;
