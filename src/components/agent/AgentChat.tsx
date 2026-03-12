'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ProposalCard from './ProposalCard';
import ThinkingIndicator from './ThinkingIndicator';

interface Proposal {
  id: string;
  type: 'DRAFT_ORDER' | 'INVENTORY_ADJUSTMENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  data: Record<string, unknown>;
}

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposals?: Proposal[];
}

interface ConversationSummary {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { proposals: number };
}

export default function AgentChat() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [proposals, setProposals] = useState<Map<string, Proposal>>(new Map());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Load conversation history on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/v1/agent/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // ignore
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/agent/conversations?id=${id}`);
      if (!res.ok) return;
      const data = await res.json();

      setConversationId(id);

      // Reconstruct display messages from stored messages
      const displayMsgs: DisplayMessage[] = [];
      const proposalMap = new Map<string, Proposal>();
      let msgCounter = 0;

      for (const msg of data.messages) {
        if (msg.role === 'user' && typeof msg.content === 'string') {
          displayMsgs.push({
            id: `msg-${msgCounter++}`,
            role: 'user',
            content: msg.content,
          });
        } else if (msg.role === 'assistant' && msg.content) {
          displayMsgs.push({
            id: `msg-${msgCounter++}`,
            role: 'assistant',
            content: msg.content,
          });
        }
      }

      // Add proposals from conversation
      for (const p of data.proposals) {
        proposalMap.set(p.id, {
          id: p.id,
          type: p.type,
          status: p.status,
          data: p.data as Record<string, unknown>,
        });
      }

      setMessages(displayMsgs);
      setProposals(proposalMap);
      setSidebarOpen(false);
    } catch {
      // ignore
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: DisplayMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: text,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Request failed');
      }

      const data = await res.json();
      setConversationId(data.conversationId);

      // Add assistant message
      const assistantMsg: DisplayMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.assistantMessage,
        proposals: data.proposals,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Track proposals
      if (data.proposals?.length > 0) {
        setProposals(prev => {
          const next = new Map(prev);
          for (const p of data.proposals) {
            next.set(p.id, p);
          }
          return next;
        });
      }

      // Refresh conversation list
      loadConversations();
    } catch (error) {
      const errorMsg: DisplayMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proposalId: string) => {
    const res = await fetch('/api/v1/agent/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Approval failed');
    }

    setProposals(prev => {
      const next = new Map(prev);
      const p = next.get(proposalId);
      if (p) next.set(proposalId, { ...p, status: 'APPROVED' });
      return next;
    });
  };

  const handleReject = async (proposalId: string) => {
    const res = await fetch('/api/v1/agent/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Rejection failed');
    }

    setProposals(prev => {
      const next = new Map(prev);
      const p = next.get(proposalId);
      if (p) next.set(proposalId, { ...p, status: 'REJECTED' });
      return next;
    });
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setProposals(new Map());
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'w-72' : 'w-0'
      } transition-all duration-200 overflow-hidden border-r border-gray-200 bg-white flex-shrink-0`}>
        <div className="w-72 h-full flex flex-col">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">History</h3>
            <button
              onClick={handleNewChat}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  conversationId === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-800 truncate">
                  {conv.title || 'Untitled'}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {new Date(conv.updatedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                  {conv._count.proposals > 0 && (
                    <span className="ml-2 text-blue-500">
                      {conv._count.proposals} proposal{conv._count.proposals !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
            ))}
            {conversations.length === 0 && (
              <div className="p-4 text-sm text-gray-400 text-center">No conversations yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="Toggle history"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-sm font-medium text-gray-700">Ops Agent</h2>
          {conversationId && (
            <button
              onClick={handleNewChat}
              className="ml-auto text-xs text-blue-600 hover:text-blue-700"
            >
              New Chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {messages.length === 0 && !loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Party On Ops Agent</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Paste customer messages, ask about inventory, or request draft orders.
                  All order-creating actions require your approval before executing.
                </p>
                <div className="grid gap-2 text-sm">
                  {[
                    '"Need 2 cases of White Claw and a bottle of Tito\'s for Saturday at 123 Main St 78704"',
                    '"What High Noon flavors do we have in stock?"',
                    '"Create a draft order for a bachelorette party - 15 guests, 4 hours"',
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(example.slice(1, -1))}
                      className="text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-gray-600"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="max-w-4xl mx-auto">
            {messages.map(msg => (
              <div key={msg.id}>
                <ChatMessage role={msg.role} content={msg.content} />
                {msg.proposals?.map(p => {
                  const currentProposal = proposals.get(p.id) || p;
                  return (
                    <ProposalCard
                      key={p.id}
                      id={p.id}
                      type={currentProposal.type as 'DRAFT_ORDER' | 'INVENTORY_ADJUSTMENT'}
                      status={currentProposal.status as 'PENDING' | 'APPROVED' | 'REJECTED'}
                      data={currentProposal.data as unknown as Parameters<typeof ProposalCard>[0]['data']}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  );
                })}
              </div>
            ))}
            {loading && <ThinkingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={loading}
        />
      </div>
    </div>
  );
}
