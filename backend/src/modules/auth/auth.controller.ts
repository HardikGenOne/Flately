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

function getErrorStatus(error: unknown): number {
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

function sendError(res: Response, error: unknown, fallbackMessage: string): Response {
  const status = getErrorStatus(error);
  return res.status(status).json({
    error: error instanceof Error ? error.message : fallbackMessage,
  });
}

function resolveFrontendBaseUrl(req: Request, origin?: string): string {
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

function redirectToLoginWithError(baseUrl: string, message: string): string {
  const redirectUrl = new URL('/login', baseUrl);
  redirectUrl.searchParams.set('error', message);
  return redirectUrl.toString();
}

export async function signup(req: Request, res: Response): Promise<void> {
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
    sendError(res, error, 'Signup failed');
  }
}

export async function login(req: Request, res: Response): Promise<void> {
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
    sendError(res, error, 'Login failed');
  }
}

export function startGoogleAuth(req: Request, res: Response): void {
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
    sendError(res, error, 'Google OAuth unavailable');
  }
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  const code = typeof req.query.code === 'string' ? req.query.code : undefined;
  const state = typeof req.query.state === 'string' ? req.query.state : undefined;

  if (!code || !state) {
    const frontendBaseUrl = resolveFrontendBaseUrl(req);
    res.redirect(redirectToLoginWithError(frontendBaseUrl, 'GOOGLE_AUTH_CODE_MISSING'));
    return;
  }

  try {
    const completion = await completeGoogleAuthorization(code, state);
    const frontendBaseUrl = resolveFrontendBaseUrl(req, completion.redirectOrigin);
    const redirectUrl = new URL(GOOGLE_CALLBACK_ROUTE, frontendBaseUrl);

    redirectUrl.searchParams.set('code', completion.exchangeCode);

    if (completion.source) {
      redirectUrl.searchParams.set('source', completion.source);
    }

    res.redirect(redirectUrl.toString());
  } catch (error) {
    const frontendBaseUrl = resolveFrontendBaseUrl(req);
    const message = error instanceof Error ? error.message : 'GOOGLE_AUTH_FAILED';
    res.redirect(redirectToLoginWithError(frontendBaseUrl, message));
  }
}

export function exchangeGoogleCode(req: Request, res: Response): void {
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
    sendError(res, error, 'Google exchange failed');
  }
}
