import { Request, Response } from 'express';
import env from '../../config/env';
import {
  completeGoogleAuthorization,
  consumeGoogleExchangeCode,
  getGoogleAuthorizationUrl,
  signInWithEmail,
  signUpWithEmail,
} from './auth.service.js';

const GOOGLE_CALLBACK_ROUTE = '/auth/callback';

export class AuthController {
  private getErrorStatus(error: unknown): number {
    if (!(error instanceof Error)) {
      return 500;
    }

    switch (error.message) {
      case 'INVALID_CREDENTIALS':
        return 401;
      case 'EMAIL_ALREADY_EXISTS':
        return 409;
      case 'GOOGLE_OAUTH_NOT_CONFIGURED':
        return 503;
      case 'GOOGLE_STATE_INVALID':
      case 'GOOGLE_EXCHANGE_CODE_INVALID':
      case 'GOOGLE_AUTH_CODE_MISSING':
        return 400;
      default:
        return 500;
    }
  }

  private sendError(res: Response, error: unknown, fallbackMessage: string): Response {
    const status = this.getErrorStatus(error);
    return res.status(status).json({
      error: error instanceof Error ? error.message : fallbackMessage,
    });
  }

  private resolveFrontendBaseUrl(req: Request, origin?: string): string {
    if (origin) {
      try {
        const parsed = new URL(origin);
        return `${parsed.origin}/`;
      } catch {
        // Ignore invalid origin and fall back to configured URL.
      }
    }

    const sourceRaw = req.query.source;
    const source = typeof sourceRaw === 'string' ? sourceRaw.trim().toLowerCase() : '';

    if (source === 'app') {
      return env.FRONTEND_URL;
    }

    return env.FRONTEND_URL;
  }

  private redirectToLoginWithError(baseUrl: string, message: string): string {
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('error', message);
    return redirectUrl.toString();
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body as {
        email?: string;
        password?: string;
        name?: string;
      };

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const session = await signUpWithEmail({
        email,
        password,
        name,
      });

      res.status(201).json(session);
      return;
    } catch (error) {
      this.sendError(res, error, 'Signup failed');
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as {
        email?: string;
        password?: string;
      };

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const session = await signInWithEmail({
        email,
        password,
      });

      res.status(200).json(session);
      return;
    } catch (error) {
      this.sendError(res, error, 'Login failed');
    }
  }

  startGoogleAuth(req: Request, res: Response): void {
    try {
      const sourceRaw = req.query.source;
      const source = typeof sourceRaw === 'string' ? sourceRaw : undefined;
      const originRaw = req.query.origin;
      const redirectOriginRaw = req.query.redirectOrigin;
      const origin =
        typeof originRaw === 'string'
          ? originRaw
          : typeof redirectOriginRaw === 'string'
            ? redirectOriginRaw
            : undefined;
      const url = getGoogleAuthorizationUrl(source, origin);
      res.redirect(url);
      return;
    } catch (error) {
      this.sendError(res, error, 'Google OAuth unavailable');
    }
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    const code = typeof req.query.code === 'string' ? req.query.code : undefined;
    const state = typeof req.query.state === 'string' ? req.query.state : undefined;

    if (!code || !state) {
      const frontendBaseUrl = this.resolveFrontendBaseUrl(req);
      res.redirect(this.redirectToLoginWithError(frontendBaseUrl, 'GOOGLE_AUTH_CODE_MISSING'));
      return;
    }

    try {
      const completion = await completeGoogleAuthorization(code, state);
      const frontendBaseUrl = this.resolveFrontendBaseUrl(req, completion.redirectOrigin);
      const redirectUrl = new URL(GOOGLE_CALLBACK_ROUTE, frontendBaseUrl);

      redirectUrl.searchParams.set('code', completion.exchangeCode);

      if (completion.source) {
        redirectUrl.searchParams.set('source', completion.source);
      }

      res.redirect(redirectUrl.toString());
    } catch (error) {
      const frontendBaseUrl = this.resolveFrontendBaseUrl(req);
      const message = error instanceof Error ? error.message : 'GOOGLE_AUTH_FAILED';
      res.redirect(this.redirectToLoginWithError(frontendBaseUrl, message));
    }
  }

  exchangeGoogleCode(req: Request, res: Response): void {
    const body = (req.body ?? {}) as { code?: unknown };
    const bodyCode = typeof body.code === 'string' ? body.code : undefined;
    const queryCode = typeof req.query.code === 'string' ? req.query.code : undefined;
    const code = bodyCode ?? queryCode;

    if (!code) {
      res.status(400).json({ error: 'GOOGLE_AUTH_CODE_MISSING' });
      return;
    }

    try {
      const session = consumeGoogleExchangeCode(code);
      res.status(200).json(session);
      return;
    } catch (error) {
      this.sendError(res, error, 'Google exchange failed');
    }
  }
}

const authController = new AuthController();

export async function signup(req: Request, res: Response): Promise<void> {
  return authController.signup(req, res);
}

export async function login(req: Request, res: Response): Promise<void> {
  return authController.login(req, res);
}

export function startGoogleAuth(req: Request, res: Response): void {
  return authController.startGoogleAuth(req, res);
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  return authController.googleCallback(req, res);
}

export function exchangeGoogleCode(req: Request, res: Response): void {
  return authController.exchangeGoogleCode(req, res);
}
