import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { kv } from '@/lib/database/client';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const redirect_uri = params.get('redirect_uri');
    const state = params.get('state');
    const code_challenge = params.get('code_challenge');
    const code_challenge_method = params.get('code_challenge_method');
    const client_id = params.get('client_id');

    if (!redirect_uri) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'redirect_uri required' },
        { status: 400 }
      );
    }
    if (!code_challenge || code_challenge_method !== 'S256') {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'PKCE S256 required' },
        { status: 400 }
      );
    }

    const code = crypto.randomBytes(32).toString('hex');

    await kv.set(
      `oauth:code:${code}`,
      { code_challenge, client_id, redirect_uri },
      { ex: 600 }
    );

    const redirect = new URL(redirect_uri);
    redirect.searchParams.set('code', code);
    if (state) redirect.searchParams.set('state', state);

    return NextResponse.redirect(redirect.toString(), 302);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json(
      { error: 'server_error', error_description: message },
      { status: 500 }
    );
  }
}
