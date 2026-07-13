import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller';
import {
  listWorkspacesValidation,
  createWorkspaceValidation,
  updateWorkspaceValidation,
  workspaceIdParamValidation,
  inviteMemberValidation,
  removeMemberValidation,
} from '../validations/workspace.validation';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { requireWorkspaceRole } from '../middlewares/requireWorkspaceRole';
import { MemberRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', validate(listWorkspacesValidation), workspaceController.list);
router.post('/', validate(createWorkspaceValidation), workspaceController.create);
router.get('/:id', validate(workspaceIdParamValidation), workspaceController.getById);
router.patch(
  '/:id',
  validate(updateWorkspaceValidation),
  requireWorkspaceRole(MemberRole.ADMIN),
  workspaceController.update,
);
router.delete('/:id', validate(workspaceIdParamValidation), workspaceController.delete);
router.get(
  '/:id/members',
  validate(workspaceIdParamValidation),
  workspaceController.listMembers,
);
router.post(
  '/:id/invite',
  validate(inviteMemberValidation),
  requireWorkspaceRole(MemberRole.ADMIN),
  workspaceController.invite,
);
router.delete(
  '/:id/members/:userId',
  validate(removeMemberValidation),
  requireWorkspaceRole(MemberRole.ADMIN),
  workspaceController.removeMember,
);

export default router;
