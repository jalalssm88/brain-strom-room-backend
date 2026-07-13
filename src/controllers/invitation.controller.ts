import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { invitationService } from '../services/invitation.service';
import { RespondInvitationDto } from '../types/invitation.types';

export class InvitationController {
  acceptByToken = asyncHandler(async (req: Request, res: Response) => {
    const workspace = await invitationService.acceptByToken(req.userId!, req.params.token as string);

    res.status(200).json({
      success: true,
      data: { workspace, message: 'Invitation accepted' },
    });
  });

  declineByToken = asyncHandler(async (req: Request, res: Response) => {
    await invitationService.declineByToken(req.userId!, req.params.token as string);

    res.status(200).json({
      success: true,
      data: { message: 'Invitation declined' },
    });
  });

  respond = asyncHandler(async (req: Request, res: Response) => {
    const dto: RespondInvitationDto = {
      invitationId: Number(req.body.invitationId),
      action: req.body.action,
    };

    const workspace = await invitationService.respond(req.userId!, dto);

    if (dto.action === 'decline') {
      res.status(200).json({
        success: true,
        data: { message: 'Invitation declined' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { workspace, message: 'Invitation accepted' },
    });
  });
}

export const invitationController = new InvitationController();
