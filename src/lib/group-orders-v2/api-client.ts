/**
 * Group Orders V2 - Frontend API Client
 */

import type {
  GroupOrderV2Full,
  ParticipantSummary,
  SubOrderFull,
  DraftCartItemView,
  CreateGroupOrderV2Input,
  CreateTabInput,
  UpdateTabInput,
  JoinGroupOrderInput,
  AddDraftItemInput,
} from './types';

const API_BASE = '/api/v2/group-orders';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success || !json.data) {
    // Extract field-level validation errors if available
    let message = json.error || 'API request failed';
    if (json.details && typeof json.details === 'object') {
      const details = json.details as { fieldErrors?: Record<string, string[]> };
      if (details.fieldErrors) {
        const fieldMessages = Object.entries(details.fieldErrors)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join('. ');
        if (fieldMessages) message = fieldMessages;
      }
    }
    throw new Error(message);
  }
  return json.data;
}

/** Create a new group order */
export async function createGroupOrderV2(
  input: CreateGroupOrderV2Input
): Promise<GroupOrderV2Full> {
  return apiFetch<GroupOrderV2Full>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Fetch group order by share code */
export async function fetchGroupOrderV2(code: string): Promise<GroupOrderV2Full> {
  return apiFetch<GroupOrderV2Full>(`${API_BASE}/${code}`);
}

/** Update group order */
export async function updateGroupOrderV2(
  code: string,
  data: { name?: string; status?: string }
): Promise<GroupOrderV2Full> {
  return apiFetch<GroupOrderV2Full>(`${API_BASE}/${code}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Cancel group order */
export async function cancelGroupOrderV2(
  code: string,
  hostParticipantId: string
): Promise<void> {
  await apiFetch(`${API_BASE}/${code}?hostParticipantId=${hostParticipantId}`, {
    method: 'DELETE',
  });
}

/** Join group order */
export async function joinGroupOrderV2(
  code: string,
  input: JoinGroupOrderInput
): Promise<ParticipantSummary> {
  return apiFetch<ParticipantSummary>(`${API_BASE}/${code}/join`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Remove participant */
export async function removeParticipantV2(
  code: string,
  pid: string,
  hostParticipantId: string
): Promise<void> {
  await apiFetch(
    `${API_BASE}/${code}/participants/${pid}?hostParticipantId=${hostParticipantId}`,
    { method: 'DELETE' }
  );
}

/** Create tab */
export async function createTabV2(
  code: string,
  input: CreateTabInput & { hostParticipantId: string }
): Promise<SubOrderFull> {
  return apiFetch<SubOrderFull>(`${API_BASE}/${code}/tabs`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Update tab */
export async function updateTabV2(
  code: string,
  tabId: string,
  input: UpdateTabInput & { hostParticipantId: string }
): Promise<SubOrderFull> {
  return apiFetch<SubOrderFull>(`${API_BASE}/${code}/tabs/${tabId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

/** Delete tab */
export async function deleteTabV2(
  code: string,
  tabId: string,
  hostParticipantId: string
): Promise<void> {
  await apiFetch(
    `${API_BASE}/${code}/tabs/${tabId}?hostParticipantId=${hostParticipantId}`,
    { method: 'DELETE' }
  );
}

/** Add item to tab */
export async function addDraftItemV2(
  code: string,
  tabId: string,
  input: AddDraftItemInput
): Promise<DraftCartItemView> {
  return apiFetch<DraftCartItemView>(`${API_BASE}/${code}/tabs/${tabId}/items`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Update item quantity */
export async function updateDraftItemV2(
  code: string,
  tabId: string,
  itemId: string,
  participantId: string,
  quantity: number
): Promise<DraftCartItemView> {
  return apiFetch<DraftCartItemView>(
    `${API_BASE}/${code}/tabs/${tabId}/items/${itemId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ participantId, quantity }),
    }
  );
}

/** Remove item */
export async function removeDraftItemV2(
  code: string,
  tabId: string,
  itemId: string,
  participantId: string
): Promise<void> {
  await apiFetch(
    `${API_BASE}/${code}/tabs/${tabId}/items/${itemId}?participantId=${participantId}`,
    { method: 'DELETE' }
  );
}

/** Create checkout session for participant's items */
export async function checkoutParticipantV2(
  code: string,
  tabId: string,
  participantId: string,
  discountCode?: string
): Promise<{ checkoutUrl: string; sessionId: string; paymentId: string }> {
  return apiFetch(`${API_BASE}/${code}/tabs/${tabId}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ participantId, discountCode }),
  });
}

/** Create delivery invoice session */
export async function createDeliveryInvoice(
  code: string,
  tabId: string,
  hostParticipantId: string,
  discountCode?: string
): Promise<{ checkoutUrl: string; sessionId: string; invoiceId: string }> {
  return apiFetch(`${API_BASE}/${code}/tabs/${tabId}/delivery-invoice`, {
    method: 'POST',
    body: JSON.stringify({ hostParticipantId, discountCode }),
  });
}
