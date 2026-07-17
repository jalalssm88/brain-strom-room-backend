import { Router } from 'express';
import { MemberRole } from '../prisma';
import { voteController } from '../controllers/vote.controller';
import { noteVotesValidation } from '../validations/vote.validation';
import { validate } from '../middlewares/validate';
import {
  requireWorkspaceMember,
  requireWorkspaceRole,
} from '../middlewares/requireWorkspaceRole';

const router = Router({ mergeParams: true });

router.get(
  '/',
  validate(noteVotesValidation),
  requireWorkspaceMember,
  voteController.getVoteslist,
);

router.post(
  '/',
  validate(noteVotesValidation),
  requireWorkspaceRole(MemberRole.ADMIN, MemberRole.EDITOR),
  voteController.toggleVote,
);

export default router;
