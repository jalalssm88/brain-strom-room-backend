import { Router } from "express";
import { invitationController } from "../controllers/invitation.controller";
import {
  invitationTokenValidation,
  respondInvitationValidation,
} from "../validations/invitation.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.use(authenticate);

router.post(
  "/:token/accept",
  validate(invitationTokenValidation),
  invitationController.acceptByToken,
);
router.post(
  "/respond",
  validate(respondInvitationValidation),
  invitationController.respond,
);

export default router;
