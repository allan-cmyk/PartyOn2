export type AuthLevel = 'read' | 'readwrite' | 'none';

export interface McpAuth {
  level: Exclude<AuthLevel, 'none'>;
  actor: string;
}

export function authenticateMcpRequest(request: Request): McpAuth | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const actor = request.headers.get('x-mcp-actor') || 'unknown';

  // Check write token first (more privileged)
  const writeToken = process.env.MCP_AUTH_TOKEN_WRITE;
  if (writeToken && token === writeToken) {
    return { level: 'readwrite', actor };
  }

  // Check read token
  const readToken = process.env.MCP_AUTH_TOKEN_READ;
  if (readToken && token === readToken) {
    return { level: 'read', actor };
  }

  // Support rotation: check _PREV tokens
  const prevWriteToken = process.env.MCP_AUTH_TOKEN_WRITE_PREV;
  if (prevWriteToken && token === prevWriteToken) {
    return { level: 'readwrite', actor };
  }

  const prevReadToken = process.env.MCP_AUTH_TOKEN_READ_PREV;
  if (prevReadToken && token === prevReadToken) {
    return { level: 'read', actor };
  }

  return null;
}
