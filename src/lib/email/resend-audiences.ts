import { resend } from './resend-client';

export interface AddContactToAudienceArgs {
  audienceId: string | undefined;
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Best-effort: add a contact to a Resend audience. Soft-fails when the Resend
 * client is not configured or no audience id is provided. Never throws — this
 * is always a side-effect and must not block the caller's response.
 */
export async function addContactToAudience({
  audienceId,
  email,
  firstName,
  lastName,
}: AddContactToAudienceArgs): Promise<void> {
  if (!resend) {
    console.log('[Resend Audience] Skipped: Resend client not configured');
    return;
  }
  if (!audienceId) {
    console.log('[Resend Audience] Skipped: no audience id provided');
    return;
  }
  if (!email) return;

  try {
    await resend.contacts.create({
      audienceId,
      email,
      firstName,
      lastName,
      unsubscribed: false,
    });
    console.log('[Resend Audience] Contact added:', { email, audienceId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Resend Audience] Failed to add contact:', { email, audienceId, error: message });
  }
}
