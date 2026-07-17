import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { noteService } from '../services/note.service';
import { CreateNoteDto, UpdateNoteDto } from '../types/note.types';

export class NoteController {
  getNoteslist = asyncHandler(async (req: Request, res: Response) => {
    const notes = await noteService.listNotes(req.workspaceId!, req.userId!);

    res.status(200).json({
      success: true,
      data: { notes },
    });
  });

  createNote = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreateNoteDto = {
      title: req.body.title,
      content: req.body.content,
      color: req.body.color,
      x: req.body.x,
      y: req.body.y,
      width: req.body.width,
      height: req.body.height,
    };

    const note = await noteService.createNote(
      req.workspaceId!,
      req.userId!,
      req.workspaceMember!.role,
      dto,
    );

    res.status(201).json({
      success: true,
      data: { note },
    });
  });

  updateNote = asyncHandler(async (req: Request, res: Response) => {
    const dto: UpdateNoteDto = {
      title: req.body.title,
      content: req.body.content,
      color: req.body.color,
      x: req.body.x,
      y: req.body.y,
      width: req.body.width,
      height: req.body.height,
    };

    const note = await noteService.updateNote(
      req.workspaceId!,
      Number(req.params.noteId),
      req.userId!,
      req.workspaceMember!.role,
      dto,
    );

    res.status(200).json({
      success: true,
      data: { note },
    });
  });

  softDelete = asyncHandler(async (req: Request, res: Response) => {
    await noteService.deleteNote(
      req.workspaceId!,
      Number(req.params.noteId),
      req.userId!,
      req.workspaceMember!.role,
    );

    res.status(200).json({
      success: true,
      data: { message: 'Note deleted successfully' },
    });
  });
}

export const noteController = new NoteController();
