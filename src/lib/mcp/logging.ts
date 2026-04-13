import { prisma } from '@/lib/database/client';

export interface McpLogEntry {
  toolName: string;
  authLevel: string;
  actor: string;
  params?: object;
  durationMs: number;
  success: boolean;
  errorMsg?: string;
  rowCount?: number;
}

export function logMcpRequest(entry: McpLogEntry): void {
  // Fire-and-forget — never block tool execution on logging
  prisma.mcpRequestLog
    .create({
      data: {
        toolName: entry.toolName,
        authLevel: entry.authLevel,
        actor: entry.actor,
        params: (entry.params ?? undefined) as Parameters<typeof prisma.mcpRequestLog.create>[0]['data']['params'],
        success: entry.success,
        errorMsg: entry.errorMsg,
        rowCount: entry.rowCount,
        durationMs: entry.durationMs,
      },
    })
    .catch(() => {
      // Silently ignore logging failures
    });
}
