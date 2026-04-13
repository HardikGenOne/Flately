import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../../config/prisma';
import env from '../../config/env';

type AuthSession = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
  };
};

type EmailCredentials = {
  email: string;
  password: string;
  name?: string;
};

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
};

type GoogleUserProfile = {
  sub: string;
  email: string;
  name: string | null;
  picture: string | null;
};

type GoogleOAuthStateEntry = {
  expiresAt: number;
  source?: string;
  redirectOrigin?: string;
};

type GoogleExchangeCodeEntry = {
  expiresAt: number;
  session: AuthSession;
};

interface EmailAuthStrategy {
  execute(credentials: EmailCredentials): Promise<AuthSession>;
}

interface OAuthAuthorizationStrategy {
  getAuthorizationUrl(source?: string, redirectOrigin?: string): string;
  completeAuthorization(
    code: string,
    state: string,
  ): Promise<{ exchangeCode: string; source?: string; redirectOrigin?: string }>;
  consumeExchangeCode(code: string): AuthSession;
}

type EmailAuthIntent = 'signup' | 'signin';
type OAuthProvider = 'google';

interface EmailAuthStrategyFactory {
  create(intent: EmailAuthIntent): EmailAuthStrategy;
}

interface OAuthAuthorizationStrategyFactory {
  create(provider: OAuthProvider): OAuthAuthorizationStrategy;
}

const GOOGLE_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const GOOGLE_EXCHANGE_CODE_TTL_MS = 2 * 60 * 1000;

const googleOAuthStatesStore = new Map<string, GoogleOAuthStateEntry>();
const googleExchangeCodesStore = new Map<string, GoogleExchangeCodeEntry>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function sanitizeSource(source?: string): string | undefined {
  if (typeof source !== 'string') {
    return undefined;
  }

  const normalized = source.trim().toLowerCase();
  if (normalized === 'mobile' || normalized === 'app') {
    return normalized;
  }

  return undefined;
}

function sanitizeRedirectOrigin(redirectOrigin?: string): string | undefined {
  if (typeof redirectOrigin !== 'string') {
    return undefined;
  }

  const candidate = redirectOrigin.trim();
  if (!candidate) {
    return undefined;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return undefined;
    }

    const normalized = parsed.origin;

    const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:5173']
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map((origin) => {
        try {
          return new URL(origin).origin;
        } catch {
          return null;
        }
      })
      .filter((origin): origin is string => origin !== null);

    if (!allowedOrigins.includes(normalized)) {
      return undefined;
    }

    return normalized;
  } catch {
    return undefined;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function signAccessToken(user: SessionUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
  };

  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

function toSession(user: SessionUser): AuthSession {
  return {
    accessToken: signAccessToken(user),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  };
}

class EmailSignUpStrategy implements EmailAuthStrategy {
  async execute(credentials: EmailCredentials): Promise<AuthSession> {
    const email = normalizeEmail(credentials.email);
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(credentials.password, 10);

    let user;

    try {
      user = await prisma.user.create({
        data: {
          email,
          name: credentials.name?.trim() || null,
          passwordHash,
          picture: null,
        },
      });
    } catch (error) {
      const isUniqueError =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002';

      if (!isUniqueError) {
        throw error;
      }

      const existingByEmail = await prisma.user.findUnique({ where: { email } });
      if (existingByEmail) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }

      throw new Error('AUTH_STORAGE_CONFLICT');
    }

    return toSession(user);
  }
}

class EmailSignInStrategy implements EmailAuthStrategy {
  async execute(credentials: EmailCredentials): Promise<AuthSession> {
    const email = normalizeEmail(credentials.email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    return toSession(user);
  }
}

class GoogleOAuthStrategy implements OAuthAuthorizationStrategy {
  constructor(
    private readonly googleOAuthStates: Map<string, GoogleOAuthStateEntry>,
    private readonly googleExchangeCodes: Map<string, GoogleExchangeCodeEntry>,
  ) {}

  private cleanExpiredGoogleOAuthState(): void {
    const now = Date.now();
    for (const [key, value] of this.googleOAuthStates.entries()) {
      if (value.expiresAt <= now) {
        this.googleOAuthStates.delete(key);
      }
    }
  }

  private cleanExpiredExchangeCodes(): void {
    const now = Date.now();
    for (const [key, value] of this.googleExchangeCodes.entries()) {
      if (value.expiresAt <= now) {
        this.googleExchangeCodes.delete(key);
      }
    }
  }

  private getGoogleConfig(): {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  } {
    const clientId = env.GOOGLE_OAUTH_CLIENT_ID.trim();
    const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET.trim();
    const callbackUrl = env.GOOGLE_OAUTH_CALLBACK_URL.trim();

    if (!clientId || !clientSecret || !callbackUrl) {
      throw new Error('GOOGLE_OAUTH_NOT_CONFIGURED');
    }

    return {
      clientId,
      clientSecret,
      callbackUrl,
    };
  }

  private createGoogleOAuthState(source?: string, redirectOrigin?: string): string {
    this.cleanExpiredGoogleOAuthState();

    const state = crypto.randomBytes(24).toString('hex');
    this.googleOAuthStates.set(state, {
      expiresAt: Date.now() + GOOGLE_OAUTH_STATE_TTL_MS,
      source: sanitizeSource(source),
      redirectOrigin: sanitizeRedirectOrigin(redirectOrigin),
    });

    return state;
  }

  private consumeGoogleOAuthState(state: string): GoogleOAuthStateEntry {
    this.cleanExpiredGoogleOAuthState();

    const found = this.googleOAuthStates.get(state);
    this.googleOAuthStates.delete(state);

    if (!found || found.expiresAt <= Date.now()) {
      throw new Error('GOOGLE_STATE_INVALID');
    }

    return found;
  }

  private createExchangeCode(session: AuthSession): string {
    this.cleanExpiredExchangeCodes();

    const code = crypto.randomBytes(24).toString('hex');
    this.googleExchangeCodes.set(code, {
      expiresAt: Date.now() + GOOGLE_EXCHANGE_CODE_TTL_MS,
      session,
    });

    return code;
  }

  private async fetchGoogleUserProfile(code: string): Promise<GoogleUserProfile> {
    const config = this.getGoogleConfig();

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('GOOGLE_TOKEN_EXCHANGE_FAILED');
    }

    const tokenPayload = await tokenResponse.json();
    if (!isRecord(tokenPayload)) {
      throw new Error('GOOGLE_TOKEN_EXCHANGE_FAILED');
    }

    const accessToken = readString(tokenPayload, 'access_token');
    if (!accessToken) {
      throw new Error('GOOGLE_TOKEN_EXCHANGE_FAILED');
    }

    const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('GOOGLE_USERINFO_FETCH_FAILED');
    }

    const userInfoPayload = await userInfoResponse.json();
    if (!isRecord(userInfoPayload)) {
      throw new Error('GOOGLE_USERINFO_FETCH_FAILED');
    }

    const sub = readString(userInfoPayload, 'sub');
    const email = readString(userInfoPayload, 'email');
    const emailVerifiedRaw = userInfoPayload.email_verified;
    const emailVerified = emailVerifiedRaw === true || emailVerifiedRaw === 'true';

    if (!sub || !email) {
      throw new Error('GOOGLE_USERINFO_FETCH_FAILED');
    }

    if (!emailVerified) {
      throw new Error('GOOGLE_EMAIL_NOT_VERIFIED');
    }

    return {
      sub,
      email,
      name: readString(userInfoPayload, 'name') ?? null,
      picture: readString(userInfoPayload, 'picture') ?? null,
    };
  }

  getAuthorizationUrl(source?: string, redirectOrigin?: string): string {
    const config = this.getGoogleConfig();
    const state = this.createGoogleOAuthState(source, redirectOrigin);

    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authorizationUrl.searchParams.set('client_id', config.clientId);
    authorizationUrl.searchParams.set('redirect_uri', config.callbackUrl);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', 'openid email profile');
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('prompt', 'select_account');

    return authorizationUrl.toString();
  }

  async completeAuthorization(
    code: string,
    state: string,
  ): Promise<{ exchangeCode: string; source?: string; redirectOrigin?: string }> {
    const stateEntry = this.consumeGoogleOAuthState(state);
    const googleProfile = await this.fetchGoogleUserProfile(code);
    const email = normalizeEmail(googleProfile.email);

    const existingByGoogleId = await prisma.user.findFirst({
      where: {
        googleId: googleProfile.sub,
      },
    });

    let user: SessionUser;

    if (existingByGoogleId) {
      user = await prisma.user.update({
        where: {
          id: existingByGoogleId.id,
        },
        data: {
          name: googleProfile.name,
          picture: googleProfile.picture,
        },
      });
    } else {
      const existingByEmail = await prisma.user.findUnique({ where: { email } });

      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: googleProfile.sub,
            name: googleProfile.name ?? existingByEmail.name,
            picture: googleProfile.picture ?? existingByEmail.picture,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: null,
            googleId: googleProfile.sub,
            name: googleProfile.name,
            picture: googleProfile.picture,
          },
        });
      }
    }

    const exchangeCode = this.createExchangeCode(toSession(user));

    return {
      exchangeCode,
      source: stateEntry.source,
      redirectOrigin: stateEntry.redirectOrigin,
    };
  }

  consumeExchangeCode(code: string): AuthSession {
    this.cleanExpiredExchangeCodes();

    const entry = this.googleExchangeCodes.get(code);
    this.googleExchangeCodes.delete(code);

    if (!entry || entry.expiresAt <= Date.now()) {
      throw new Error('GOOGLE_EXCHANGE_CODE_INVALID');
    }

    return entry.session;
  }
}

class DefaultEmailAuthStrategyFactory implements EmailAuthStrategyFactory {
  private readonly creators: Record<EmailAuthIntent, () => EmailAuthStrategy> = {
    signup: () => new EmailSignUpStrategy(),
    signin: () => new EmailSignInStrategy(),
  };

  create(intent: EmailAuthIntent): EmailAuthStrategy {
    const creator = this.creators[intent];

    if (!creator) {
      throw new Error('UNSUPPORTED_EMAIL_AUTH_INTENT');
    }

    return creator();
  }
}

class DefaultOAuthAuthorizationStrategyFactory implements OAuthAuthorizationStrategyFactory {
  constructor(
    private readonly googleOAuthStates: Map<string, GoogleOAuthStateEntry>,
    private readonly googleExchangeCodes: Map<string, GoogleExchangeCodeEntry>,
  ) {}

  create(provider: OAuthProvider): OAuthAuthorizationStrategy {
    switch (provider) {
      case 'google':
        return new GoogleOAuthStrategy(this.googleOAuthStates, this.googleExchangeCodes);
      default:
        throw new Error('GOOGLE_OAUTH_NOT_CONFIGURED');
    }
  }
}

class AuthStrategyFactory {
  constructor(
    private readonly emailFactory: EmailAuthStrategyFactory,
    private readonly oauthFactory: OAuthAuthorizationStrategyFactory,
  ) {}

  createEmailStrategy(intent: EmailAuthIntent): EmailAuthStrategy {
    return this.emailFactory.create(intent);
  }

  createOAuthStrategy(provider: OAuthProvider): OAuthAuthorizationStrategy {
    return this.oauthFactory.create(provider);
  }
}

function createAuthStrategyFactory(): AuthStrategyFactory {
  const emailFactory = new DefaultEmailAuthStrategyFactory();
  const oauthFactory = new DefaultOAuthAuthorizationStrategyFactory(
    googleOAuthStatesStore,
    googleExchangeCodesStore,
  );

  return new AuthStrategyFactory(emailFactory, oauthFactory);
}

export async function signUpWithEmail(credentials: EmailCredentials): Promise<AuthSession> {
  const factory = createAuthStrategyFactory();
  return factory.createEmailStrategy('signup').execute(credentials);
}

export async function signInWithEmail(credentials: EmailCredentials): Promise<AuthSession> {
  const factory = createAuthStrategyFactory();
  return factory.createEmailStrategy('signin').execute(credentials);
}

export function getGoogleAuthorizationUrl(source?: string, redirectOrigin?: string): string {
  const factory = createAuthStrategyFactory();
  return factory.createOAuthStrategy('google').getAuthorizationUrl(source, redirectOrigin);
}

export async function completeGoogleAuthorization(
  code: string,
  state: string,
): Promise<{ exchangeCode: string; source?: string; redirectOrigin?: string }> {
  const factory = createAuthStrategyFactory();
  return factory.createOAuthStrategy('google').completeAuthorization(code, state);
}

export function consumeGoogleExchangeCode(code: string): AuthSession {
  const factory = createAuthStrategyFactory();
  return factory.createOAuthStrategy('google').consumeExchangeCode(code);
}
