import { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

type Role = 'assistant' | 'user';

type ChatMessage = { id: string; role: Role; text: string };

const INTRO =
  'Hello. I have full visibility into your engines and open items. What would you like to review?';

const PARTICLES: { left: string; bottom: string; dur: string; delay: string }[] = [
  { left: '8%', bottom: '15%', dur: '5s', delay: '0s' },
  { left: '22%', bottom: '10%', dur: '6.5s', delay: '0.4s' },
  { left: '38%', bottom: '20%', dur: '4.5s', delay: '0.8s' },
  { left: '52%', bottom: '8%', dur: '7s', delay: '1.2s' },
  { left: '65%', bottom: '18%', dur: '5.5s', delay: '1.6s' },
  { left: '78%', bottom: '12%', dur: '6s', delay: '2s' },
  { left: '90%', bottom: '22%', dur: '4.8s', delay: '2.4s' },
  { left: '15%', bottom: '25%', dur: '7.5s', delay: '2.8s' },
  { left: '45%', bottom: '5%', dur: '5.2s', delay: '3.2s' },
  { left: '72%', bottom: '28%', dur: '6.8s', delay: '3.6s' },
  { left: '30%', bottom: '30%', dur: '8s', delay: '4s' },
  { left: '85%', bottom: '6%', dur: '5.8s', delay: '4.4s' },
  { left: '55%', bottom: '15%', dur: '6.2s', delay: '4.8s' },
  { left: '10%', bottom: '8%', dur: '7.2s', delay: '5.2s' },
];

const GemAiChat = ({ embeddedInFooter = false }: { embeddedInFooter?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, open]);

  const closeChat = useCallback(() => {
    if (!open) return;
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 250);
  }, [open]);

  const openChat = useCallback(() => {
    if (open) return;
    setClosing(false);
    setOpen(true);
    setMessages((prev) => (prev.length === 0 ? [{ id: 'intro', role: 'assistant', text: INTRO }] : prev));
    window.setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      const pill = document.getElementById('gem-ai-pill');
      const win = document.getElementById('gem-ai-window');
      if (open && pill && win && !pill.contains(t) && !win.contains(t)) {
        closeChat();
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, closeChat]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text:
            'Thanks — I noted that. For detailed status, open an engine card or ask your CAM for specifics.',
        },
      ]);
    }, 900);
  };

  return (
    <>
      <div className={`gem-ai-wrapper ${embeddedInFooter ? 'gem-ai-wrapper--footer' : ''}`}>
        <button
          type="button"
          id="gem-ai-pill"
          className="gem-ai-pill"
          aria-expanded={open}
          aria-controls="gem-ai-window"
          onClick={() => (open ? closeChat() : openChat())}
        >
          <div className="gem-ai-orb gem-ai-orb--pill" aria-hidden />
          <span className={`gem-ai-pill-label ${embeddedInFooter ? 'hidden min-[400px]:inline' : ''}`}>ASK AI</span>
        </button>
      </div>

      <div
        id="gem-ai-window"
        className={`gem-chat-window ${embeddedInFooter ? 'gem-chat-window--footer' : ''} ${open && !closing ? 'gem-chat-window--open' : ''} ${closing ? 'gem-chat-window--closing' : ''}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="gem-chat-outer">
          <div className="gem-chat-inner">
            <div className="gem-chat-header">
              <div className="gem-chat-header-left">
                <div className="gem-ai-orb" aria-hidden />
                <span className="gem-chat-header-title">GEM AI</span>
              </div>
              <button type="button" className="gem-chat-close" onClick={closeChat} aria-label="Close chat">
                ✕
              </button>
            </div>
            <div className="gem-chat-messages">
              {messages.map((m) => (
                <div key={m.id} className={`gem-chat-msg gem-chat-msg--${m.role}`}>
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="gem-chat-typing" aria-hidden>
                  <span className="gem-chat-typing-dot" />
                  <span className="gem-chat-typing-dot" />
                  <span className="gem-chat-typing-dot" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="gem-chat-input-row">
              <input
                ref={inputRef}
                type="text"
                className="gem-chat-input"
                placeholder="Ask about your engines..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button type="button" className="gem-chat-send" onClick={send} aria-label="Send">
                <Send className="gem-chat-send-icon" />
              </button>
            </div>
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                className="gem-chat-particle"
                style={{
                  left: p.left,
                  bottom: p.bottom,
                  ['--dur' as string]: p.dur,
                  ['--delay' as string]: p.delay,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GemAiChat;
