import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { getIdentifier } from './rate-limit';

export interface RateLimitedRouteHandler {
  (request: NextRequest, context?: unknown): Promise<NextResponse>;
}

export function withRateLimit(
  handler: RateLimitedRouteHandler,
  limiter: Ratelimit
): RateLimitedRouteHandler {
  return async (request: NextRequest, context?: unknown) => {
    const identifier = getIdentifier(request);

    try {
      const { success, limit, remaining, reset, pending } =
        await limiter.limit(identifier);

      // Set rate limit headers
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', limit.toString());
      headers.set('X-RateLimit-Remaining', remaining.toString());
      headers.set('X-RateLimit-Reset', reset.toString());

      if (!success) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            message: 'Please try again later',
            limit,
            remaining: 0,
            reset,
          },
          {
            status: 429,
            headers,
          }
        );
      }

      // Call the actual handler
      const response = await handler(request, context);

      // Add rate limit headers to successful responses
      for (const [key, value] of headers.entries()) {
        response.headers.set(key, value);
      }

      return response;
    } catch (error) {
      console.error('Rate limit error:', error);
      // If rate limiting fails, allow the request through
      return handler(request, context);
    }
  };
}
