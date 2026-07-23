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
import { MemberRole } from '../prisma';
import noteRoutes from './note.routes';
import chatRoutes from './chat.routes';

const router = Router();

router.use(authenticate);

router.get('/', validate(listWorkspacesValidation), workspaceController.getWorkspaceslist);
router.post('/', validate(createWorkspaceValidation), workspaceController.createWorkspace);
router.get('/:id', validate(workspaceIdParamValidation), workspaceController.getWorkspaceById);
router.patch(
  '/:id',
  validate(updateWorkspaceValidation),
  requireWorkspaceRole(MemberRole.ADMIN),
  workspaceController.updateWorkspace,
);
router.delete('/:id', validate(workspaceIdParamValidation), workspaceController.deleteWorkspace);
router.get(
  '/:id/members',
  validate(workspaceIdParamValidation),
  workspaceController.getWorkspaceMembers,
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

router.use('/:id/notes', noteRoutes);
router.use('/:id/messages', chatRoutes);

export default router;
