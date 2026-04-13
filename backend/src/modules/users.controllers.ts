import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { getOrCreateUser } from './users.service';

export class UsersController {
  async getUserProfile(req: AuthRequest, res: Response): Promise<void> {
    const payload = req.auth?.payload;
    const userId = req.userId as string;

    const user = await getOrCreateUser({
      userId,
      email: typeof payload?.email === 'string' ? payload.email : undefined,
      name: typeof payload?.name === 'string' ? payload.name : undefined,
      picture: typeof payload?.picture === 'string' ? payload.picture : undefined,
    });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}

const usersController = new UsersController();

export async function getUserProfile(req: AuthRequest, res: Response): Promise<void> {
  return usersController.getUserProfile(req, res);
}
