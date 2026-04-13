import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { getPreferences, savePreferences } from './preferences.service';

export class PreferencesController {
  async getMyPreferences(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId as string;
    const prefs = await getPreferences(userId);
    res.json(prefs);
  }

  async saveMyPreferences(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId as string;
    const prefs = await savePreferences(
      userId,
      req.body as Parameters<typeof savePreferences>[1],
    );

    res.json(prefs);
  }
}

const preferencesController = new PreferencesController();

export async function getMyPreferences(req: AuthRequest, res: Response): Promise<void> {
  return preferencesController.getMyPreferences(req, res);
}

export async function saveMyPreferences(req: AuthRequest, res: Response): Promise<void> {
  return preferencesController.saveMyPreferences(req, res);
}
