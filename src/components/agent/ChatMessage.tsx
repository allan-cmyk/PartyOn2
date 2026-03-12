'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex items-start gap-3 px-4 py-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-blue-600' : 'bg-blue-100'
      }`}>
        <span className={`text-xs font-bold ${isUser ? 'text-white' : 'text-blue-600'}`}>
          {isUser ? 'You' : 'AI'}
        </span>
      </div>
      <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
        isUser
          ? 'bg-blue-600 text-white'
          : 'bg-white border border-gray-200 text-gray-800'
      }`}>
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}
