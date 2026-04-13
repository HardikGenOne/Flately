import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { getCloudinaryUploadSignature } from './uploads.service';

export class UploadsController {
  async createUploadSignature(_req: AuthRequest, res: Response): Promise<void> {
    const payload = getCloudinaryUploadSignature();
    res.json(payload);
  }
}

const uploadsController = new UploadsController();

export async function createUploadSignature(_req: AuthRequest, res: Response): Promise<void> {
  return uploadsController.createUploadSignature(_req, res);
}
