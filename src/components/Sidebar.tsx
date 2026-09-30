import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  ChevronLeft,
  Send,
  Trash2,
  Download,
  ExternalLink,
  Bot,
  User,
  Clock,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { MerchGraphicItem, ChatMessage } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'chat' | 'library';
  setActiveTab: (tab: 'chat' | 'library') => void;
  library: MerchGraphicItem[];
  activeItem: MerchGraphicItem | null;
  onSelectItem: (item: MerchGraphicItem) => void;
  onDeleteItem: (id: string) => void;
  onApplyPromptSuggestion: (prompt: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  library,
  activeItem,
  onSelectItem,
  onDeleteItem,
  onApplyPromptSuggestion,
}) => {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Hello! I am your MerchGraphic AI Assistant. Upload any photo of merchandise (t-shirts, hoodies, mugs, bags, packaging) and I will extract the flat isolated graphics for clean downloading. Ask me anything about graphic isolation, vectorization, or print formatting!',
      timestamp: Date.now(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat' && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isOpen]);

  // Quick chat prompts
  const samplePrompts = [
    'How do I isolate white text on a black t-shirt?',
    'Remove fabric wrinkles and garment folds completely',
    'What resolution is best for DTG merchandise printing?',
    'Extract only the central illustration without circular frame',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          currentGraphicContext: activeItem
            ? {
                title: activeItem.title,
                type: activeItem.analysis?.graphicType || 'Merchandise Print',
                text: activeItem.analysis?.detectedText || '',
              }
            : null,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: data.reply,
            timestamp: Date.now(),
          },
        ]);
      } else {
        throw new Error(data.error || 'No response from assistant');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          content:
            'I encountered an issue connecting to Gemini. You can still use the Extract button to pull graphics directly off your merchandise!',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 sm:w-96 flex-shrink-0 h-[calc(100vh-4rem)] border-r border-[#262035] bg-[#0c0a13] flex flex-col z-20 transition-all duration-300 shadow-2xl shadow-black/60">
      {/* Sidebar Top Nav Tabs & Close */}
      <div className="p-3 border-b border-[#241e35] flex items-center justify-between bg-[#110e1a]">
        <div className="flex items-center gap-1 bg-[#1a1527] p-1 rounded-lg border border-[#2e2643]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-[#2b223f] text-[#f4b8cf] shadow-sm border border-[#f4b8cf]/30'
                : 'text-[#9c94ad] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f4b8cf]" />
            AI Tutor Chat
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'library'
                ? 'bg-[#2b223f] text-[#c4b5fd] shadow-sm border border-[#c4b5fd]/30'
                : 'text-[#9c94ad] hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#c4b5fd]" />
            Image Library ({library.length})
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#958ea4] hover:text-white hover:bg-[#221c32] transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: AI Chat Assistant */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Active Context Banner if item loaded */}
          {activeItem && (
            <div className="px-3.5 py-2 bg-[#171324] border-b border-[#29223c] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-[#f4b8cf] animate-pulse" />
                <span className="text-[#dcd6e8] truncate font-medium">
                  Active: <strong className="text-white">{activeItem.title}</strong>
                </span>
              </div>
              {activeItem.extractedImage && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#c4b5fd]/20 text-[#e9d5ff] font-mono">
                  Extracted
                </span>
              )}
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f4b8cf]/30 to-[#c4b5fd]/30 border border-[#f4b8cf]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-[#f4b8cf]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#2c223e] text-white border border-[#f4b8cf]/30 rounded-br-none shadow-md shadow-black/20'
                      : 'bg-[#151221] text-[#e2dde9] border border-[#2d2542] rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Extract action prompt if available in response */}
                  {msg.content.includes('[Suggested Action:') && (
                    <button
                      onClick={() => {
                        const match = msg.content.match(/\[Suggested Action: (.*?)\]/);
                        if (match && match[1]) {
                          onApplyPromptSuggestion(match[1]);
                        }
                      }}
                      className="mt-2.5 w-full text-left p-2 rounded-lg bg-[#221c32] hover:bg-[#2d2542] border border-[#f4b8cf]/30 text-[11px] text-[#ffd6e8] font-medium transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-[#f4b8cf]" />
                      <span>Use this extraction direction</span>
                    </button>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#2a223c] border border-[#f4b8cf]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-[#ffd6e8]" />
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex gap-2.5 items-center text-xs text-[#a299b3] pl-1">
                <div className="w-7 h-7 rounded-full bg-[#181426] border border-[#2d2542] flex items-center justify-center">
                  <RefreshCw className="w-3.5 h-3.5 text-[#f4b8cf] animate-spin" />
                </div>
                <span>Gemini AI is crafting advice...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 border-t border-[#231d33] bg-[#0e0c17]">
            <div className="text-[10px] text-[#8e85a0] mb-1.5 flex items-center gap-1 font-medium px-1">
              <HelpCircle className="w-3 h-3 text-[#c4b5fd]" />
              Quick Prompts:
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="text-[11px] px-2 py-1 rounded-md bg-[#191526] hover:bg-[#251f38] text-[#d6cfe2] hover:text-white border border-[#2d2542] hover:border-[#f4b8cf]/30 transition-all text-left truncate max-w-full"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-[#252037] bg-[#110e1c] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask AI or instruct extraction tweaks..."
              className="flex-1 bg-[#1a1628] border border-[#2e2644] focus:border-[#f4b8cf]/60 focus:outline-none focus:ring-1 focus:ring-[#f4b8cf]/40 rounded-lg px-3 py-2 text-xs text-white placeholder-[#787088] transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="p-2 rounded-lg bg-gradient-to-tr from-[#f4b8cf] to-[#c4b5fd] text-black font-semibold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5 text-black" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Image Library */}
      {activeTab === 'library' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {library.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#857d97]">
              <div className="w-12 h-12 rounded-2xl bg-[#171325] border border-[#2e2646] flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-[#f4b8cf]/50" />
              </div>
              <h4 className="text-sm font-semibold text-[#e1dbe9] mb-1">
                Library is empty
              </h4>
              <p className="text-xs text-[#8c849e]">
                Upload merchandise photos to start building your extracted graphic gallery.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-[#9d95af] px-1">
                <span>Saved Items ({library.length})</span>
                <span className="text-[10px] text-[#c4b5fd]">Click to load</span>
              </div>

              <div className="space-y-2.5">
                {library.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer group flex gap-3 items-center ${
                        isSelected
                          ? 'bg-[#221a35] border-[#f4b8cf]/50 ring-1 ring-[#f4b8cf]/30 shadow-lg shadow-black/40'
                          : 'bg-[#151221] border-[#29223b] hover:border-[#40365c] hover:bg-[#1b172a]'
                      }`}
                    >
                      {/* Thumbnail comparison preview */}
                      <div className="w-14 h-14 rounded-lg bg-[#0e0c16] border border-[#2d2542] overflow-hidden flex-shrink-0 relative">
                        <img
                          src={item.extractedImage || item.originalImage}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                        {item.extractedImage && (
                          <span className="absolute bottom-0 right-0 bg-[#f4b8cf] text-black text-[8px] font-bold px-1 rounded-tl">
                            RAW
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#9a91aa] truncate mt-0.5">
                          {item.analysis?.graphicType || item.extractionMode}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#7d748f]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {item.extractedImage && (
                            <span className="text-[#c4b5fd] flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="p-1.5 rounded-lg text-[#7c748d] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete from Library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
};
