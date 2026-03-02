'use client';

import { useState, useRef, useEffect, ReactElement } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedActions?: SuggestedAction[];
}

interface SuggestedAction {
  type: string;
  label: string;
  data?: Record<string, unknown>;
}

interface QuickQuery {
  label: string;
  query: string;
}

const QUICK_QUERIES: QuickQuery[] = [
  { label: "What's running low?", query: 'What items are at or below low stock threshold?' },
  { label: 'Reorder suggestions', query: 'What should I reorder and how much?' },
  { label: 'Inventory summary', query: 'Give me an overview of current inventory status.' },
  { label: 'Best sellers', query: 'What are the best selling items in the last 30 days?' },
  { label: 'Dead stock', query: 'Which items have had no sales recently?' },
];

export default function AIAssistantPage(): ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/ai/inventory/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.data.answer,
          suggestedActions: data.data.suggestedActions,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${data.error || 'Unknown error'}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = (quickQuery: 'insights' | 'low_stock' | 'reorder') => {
    const queryMap = {
      insights: "What's the current inventory status?",
      low_stock: "What items are running low?",
      reorder: "What should I reorder?",
    };
    sendMessage(queryMap[quickQuery]);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Inventory Assistant</h1>
        <p className="text-gray-600">
          Ask questions about your inventory in natural language
        </p>
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Questions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {QUICK_QUERIES.map((query, index) => (
              <button
                key={index}
                onClick={() => sendMessage(query.query)}
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <p className="font-medium text-gray-900">{query.label}</p>
              </button>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
            Quick Reports
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleQuickQuery('insights')}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Get Insights
            </button>
            <button
              onClick={() => handleQuickQuery('low_stock')}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Low Stock Alert
            </button>
            <button
              onClick={() => handleQuickQuery('reorder')}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Reorder Suggestions
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.suggestedActions && message.suggestedActions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
                  {message.suggestedActions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your inventory..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
