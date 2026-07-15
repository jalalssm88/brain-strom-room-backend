import { Router } from "express";
import { MemberRole } from "../prisma";
import { noteController } from "../controllers/note.controller";
import {
  listNotesValidation,
  createNoteValidation,
  updateNoteValidation,
  noteIdParamValidation,
} from "../validations/note.validation";
import { validate } from "../middlewares/validate";
import {
  requireWorkspaceMember,
  requireWorkspaceRole,
} from "../middlewares/requireWorkspaceRole";

const router = Router({ mergeParams: true });

router.get(
  "/",
  validate(listNotesValidation),
  requireWorkspaceMember,
  noteController.getNoteslist,
);
router.post(
  "/",
  validate(createNoteValidation),
  requireWorkspaceRole(MemberRole.ADMIN, MemberRole.EDITOR),
  noteController.createNote,
);
router.patch(
  "/:noteId",
  validate(updateNoteValidation),
  requireWorkspaceRole(MemberRole.ADMIN, MemberRole.EDITOR),
  noteController.updateNote,
);
router.delete(
  "/:noteId",
  validate(noteIdParamValidation),
  requireWorkspaceRole(MemberRole.ADMIN, MemberRole.EDITOR),
  noteController.softDelete,
);

export default router;
