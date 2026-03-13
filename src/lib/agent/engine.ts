/**
 * Agent Loop Engine
 * Orchestrates the AI agent's tool-use loop for the ops assistant.
 */

import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';
import { callOpenRouterWithTools, AI_MODELS } from '@/lib/ai/inventory-client';
import type { AgentMessage } from '@/lib/ai/inventory-client';
import { AGENT_TOOLS, executeTool } from './tools';
import { ORDER_LOGIC } from './order-logic-content';

const MAX_ITERATIONS = 10;

interface AgentProposalResult {
  id: string;
  type: string;
  status: string;
  data: unknown;
}

interface RunAgentResult {
  conversationId: string;
  assistantMessage: string;
  proposals: AgentProposalResult[];
}

/**
 * Build the system prompt for the agent
 */
function buildSystemPrompt(): string {
  const orderLogic = ORDER_LOGIC;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `You are the Party On Delivery ops assistant. You help operators manage inventory and create draft orders (invoices) for customers.

## Your Capabilities
- Search the product catalog and check real-time inventory
- Look up existing customers by name, email, or phone
- Calculate accurate delivery fees, tax, and order totals
- Build draft order proposals for operator approval
- Propose inventory adjustments for operator approval
- Recommend drinks based on party type, guest count, and duration

## Order Creation Workflow
When an operator pastes a customer message requesting an order:
1. Extract: customer name, contact info, delivery address, date/time, desired products
2. Search the catalog for each requested product -- pick the correct variant (size matters: "Tito's" = 750ml unless specified)
3. Calculate delivery fee using the customer's zip code
4. Build the draft order proposal with accurate line items, tax, and delivery fee
5. Present the proposal for operator approval

## Business Rules
${orderLogic}

## Important
- NEVER execute orders or inventory changes directly. Always use proposal tools.
- If customer info is incomplete (missing address, date, etc.), note what is missing -- the operator can fill it in.
- When recommending quantities for a party, use the drink formula: ceil(guests * hours * drinksPerHourRate).
- Default variant: when a product has multiple variants, pick the most common size (e.g., 750ml for spirits, 12-pack for seltzers) unless the customer specifies otherwise.
- Be concise. Present information clearly without unnecessary filler.
- Today's date: ${today}`;
}

/**
 * Run the agent loop
 */
export async function runAgent(input: {
  conversationId?: string;
  userMessage: string;
}): Promise<RunAgentResult> {
  // Load or create conversation
  let conversation;
  if (input.conversationId) {
    conversation = await prisma.agentConversation.findUnique({
      where: { id: input.conversationId },
    });
    if (!conversation) {
      throw new Error('Conversation not found');
    }
  }

  if (!conversation) {
    conversation = await prisma.agentConversation.create({
      data: {
        messages: [],
        title: input.userMessage.slice(0, 100),
      },
    });
  }

  // Build message history
  const storedMessages = (conversation.messages as unknown as AgentMessage[]) || [];
  const messages: AgentMessage[] = [
    { role: 'system', content: buildSystemPrompt() },
    ...storedMessages,
    { role: 'user', content: input.userMessage },
  ];

  // Agent loop
  let iterations = 0;
  let finalContent = '';
  const newProposalIds: string[] = [];

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await callOpenRouterWithTools(
      AI_MODELS.query,
      messages,
      AGENT_TOOLS,
      { temperature: 0.3, maxTokens: 4000 }
    );

    const choice = response.choices[0];
    if (!choice) {
      throw new Error('No response from AI model');
    }

    const assistantMsg = choice.message;

    // Add assistant message to history
    messages.push(assistantMsg);

    // If the model wants to call tools
    if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
      // Execute each tool call
      for (const toolCall of assistantMsg.tool_calls) {
        let args: Record<string, unknown>;
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch {
          args = {};
        }

        const result = await executeTool(
          toolCall.function.name,
          args,
          { conversationId: conversation.id }
        );

        // Track proposal IDs from proposal tools
        if (toolCall.function.name.endsWith('_proposal')) {
          try {
            const parsed = JSON.parse(result);
            if (parsed.proposalId) {
              newProposalIds.push(parsed.proposalId);
            }
          } catch {
            // ignore parse errors
          }
        }

        // Add tool result to messages
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      // Loop again to let the model process tool results
      continue;
    }

    // No tool calls -- model is done
    finalContent = assistantMsg.content || '';
    break;
  }

  if (!finalContent && iterations >= MAX_ITERATIONS) {
    finalContent = 'I reached the maximum number of steps. Please try again with a simpler request.';
  }

  // Save updated conversation (exclude system prompt from stored messages)
  const messagesToStore = messages.filter((m) => m.role !== 'system');
  await prisma.agentConversation.update({
    where: { id: conversation.id },
    data: {
      messages: messagesToStore as unknown as Prisma.InputJsonValue,
    },
  });

  // Fetch any proposals created during this run
  const proposals = newProposalIds.length > 0
    ? await prisma.agentProposal.findMany({
        where: { id: { in: newProposalIds } },
      })
    : [];

  return {
    conversationId: conversation.id,
    assistantMessage: finalContent,
    proposals: proposals.map(p => ({
      id: p.id,
      type: p.type,
      status: p.status,
      data: p.data,
    })),
  };
}

/**
 * List recent conversations
 */
export async function listConversations(limit = 20) {
  return prisma.agentConversation.findMany({
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { proposals: true } },
    },
  });
}

/**
 * Load a conversation with its messages and proposals
 */
export async function loadConversation(conversationId: string) {
  const conversation = await prisma.agentConversation.findUnique({
    where: { id: conversationId },
    include: {
      proposals: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) return null;

  return {
    id: conversation.id,
    title: conversation.title,
    messages: conversation.messages as unknown as AgentMessage[],
    proposals: conversation.proposals.map(p => ({
      id: p.id,
      type: p.type,
      status: p.status,
      data: p.data,
      resultData: p.resultData,
      createdAt: p.createdAt,
    })),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}
