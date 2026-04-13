import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { getDiscoveryFeed, swipeUser } from './discovery.service';

export class DiscoveryController {
  private isSwipeAction(value: unknown): value is 'like' | 'dislike' {
    // Accept 'skip' from frontend and treat as 'dislike'
    return value === 'like' || value === 'dislike' || value === 'skip' || value === 'superlike';
  }

  async getFeed(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId as string;

    const feed = await getDiscoveryFeed(userId);
    res.json(feed);
  }

  async swipe(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId as string;

    const body = req.body as Record<string, unknown>;
    const toUserId = body.toUserId;
    const action = body.action;

    if (typeof toUserId !== 'string' || !this.isSwipeAction(action)) {
      res.status(400).json({ error: 'Invalid action' });
      return;
    }

    await swipeUser(userId, toUserId, action);
    res.json({ success: true });
  }
}

const discoveryController = new DiscoveryController();

export async function getFeed(req: AuthRequest, res: Response): Promise<void> {
  return discoveryController.getFeed(req, res);
}

export async function swipe(req: AuthRequest, res: Response): Promise<void> {
  return discoveryController.swipe(req, res);
}
