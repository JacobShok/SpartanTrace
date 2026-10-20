import React, { useState, useRef, useEffect } from 'react';
import { X, Send, AlertTriangle, ShieldCheck, MessageCircle, ChevronLeft } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/formatters';

interface ChatDrawerProps {
  onOpenReportModal: (type: 'message', id: string, ownerId: string, ownerName: string, snippet: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ onOpenReportModal }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    isOpen,
    closeChat,
    sendMessage,
    openChatWithConversation,
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [showConvList, setShowConvList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const text = inputMessage.trim();
    setInputMessage('');
    await sendMessage(text);
  };

  const otherPersonName =
    activeConversation && user
      ? activeConversation.finderId === user.id
        ? activeConversation.claimantName
        : activeConversation.finderName
      : 'User';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[420px] bg-white shadow-2xl border-l border-gray-200 flex flex-col transform transition-transform duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          {conversations.length > 1 && (
            <button
              onClick={() => setShowConvList(!showConvList)}
              className="p-1 hover:bg-gray-200 rounded-lg text-gray-500"
              title="All Conversations"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {activeConversation ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={activeConversation.listingPhoto}
                alt="Item thumbnail"
                className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
              />
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-gray-900 truncate">
                  {activeConversation.listingTitle}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <span>Chat with</span>
                  <span className="font-semibold text-emerald-700 truncate">{otherPersonName}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900">Direct Messages</h3>
            </div>
          )}
        </div>

        <button
          onClick={closeChat}
          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Slide-over conversation switcher list if multiple */}
      {showConvList && (
        <div className="p-3 bg-gray-100 border-b border-gray-200 space-y-1.5 max-h-48 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Active Chats ({conversations.length})
          </p>
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                openChatWithConversation(c.id);
                setShowConvList(false);
              }}
              className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                c.id === activeConversation?.id
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white hover:bg-emerald-50 text-gray-800'
              }`}
            >
              <img src={c.listingPhoto} className="w-7 h-7 rounded object-cover shrink-0" alt="" />
              <div className="truncate flex-1">
                <p className="truncate font-medium">{c.listingTitle}</p>
                <p className={`text-[10px] truncate ${c.id === activeConversation?.id ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {c.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Messages Thread (FR05, FR15) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400">
            No messages yet. Send a message to coordinate item verification and meetup!
          </div>
        ) : (
          messages.map((m) => {
            const isMe = user?.id === m.senderId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-gray-500">
                    {isMe ? 'You' : m.senderName}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatRelativeTime(m.createdAt)}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs relative leading-relaxed ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {/* FR26: Report message button */}
                  {!isMe && (
                    <button
                      onClick={() =>
                        onOpenReportModal('message', m.id, m.senderId, m.senderName, m.content)
                      }
                      className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                      title="Report message"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Safety Notice Banner */}
      <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-800">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>SJSU Safe Return: Meet in open public spaces like MLK Library or Student Union.</span>
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
        <input
          type="text"
          placeholder={`Message ${otherPersonName}...`}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 text-xs border border-gray-300 rounded-full px-4 py-2.5 focus:outline-emerald-500 focus:border-emerald-500 bg-gray-50"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 text-white rounded-full transition-colors shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
