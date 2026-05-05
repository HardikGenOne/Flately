import { Request, Response, NextFunction } from 'express'

export class DomainError extends Error {
  constructor(
    public readonly code: string,
    public readonly httpStatus: number,
    message: string
  ) {
    super(message)
    this.name = 'DomainError'
  }
}

export const Errors = {
  UNAUTHORIZED: new DomainError('UNAUTHORIZED', 401, 'Authentication required'),
  FORBIDDEN: new DomainError('FORBIDDEN', 403, 'Access denied'),
  ONBOARDING_REQUIRED: new DomainError('ONBOARDING_REQUIRED', 403, 'Onboarding completion is required'),
  NOT_FOUND: (resource: string) => new DomainError('NOT_FOUND', 404, `${resource} not found`),
  CONFLICT: (msg: string) => new DomainError('CONFLICT', 409, msg),
} as const

export function domainErrorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof DomainError) {
    res.status(err.httpStatus).json({ error: err.code, message: err.message })
    return
  }
  console.error('[Unhandled Error]', err)
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' })
}
