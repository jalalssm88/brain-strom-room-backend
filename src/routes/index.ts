import { Router } from 'express';
import authRoutes from './auth.routes';
import workspaceRoutes from './workspace.routes';
import invitationRoutes from './invitation.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/invitations', invitationRoutes);
router.use('/notifications', notificationRoutes);

export default router;
