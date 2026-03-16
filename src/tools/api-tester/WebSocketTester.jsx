import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Send, Trash2, X, Plug, PlugZap, ArrowUpRight, ArrowDownLeft, Clock, Copy, Check } from 'lucide-react';
import { generateId, formatDuration } from '../../utils/helpers';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

const WS_STATES = {
  0: { label: 'Connecting', color: 'text-warning', badge: 'badge-warning' },
  1: { label: 'Connected', color: 'text-success', badge: 'badge-success' },
  2: { label: 'Closing', color: 'text-warning', badge: 'badge-warning' },
  3: { label: 'Closed', color: 'text-error', badge: 'badge-error' },
};

const SAMPLE_URLS = [
  { url: 'wss://echo.websocket.org', label: 'Echo Server' },
  { url: 'wss://ws.postman-echo.com/raw', label: 'Postman Echo' },
  { url: 'wss://socketsbay.com/wss/v2/1/demo/', label: 'SocketsBay Demo' },
];

const SAMPLE_MESSAGES = [
  { label: 'Hello', msg: 'Hello, WebSocket!' },
  { label: 'JSON', msg: '{"type": "ping", "data": {"timestamp": ' + Date.now() + '}}' },
  { label: 'Subscribe', msg: '{"action": "subscribe", "channel": "updates"}' },
];

export default function WebSocketTester({ onClose }) {
  const [url, setUrl] = useState('wss://echo.websocket.org');
  const [message, setMessage] = useState('Hello, WebSocket!');
  const [messages, setMessages] = useState([]);
  const [connectionState, setConnectionState] = useState(3);
  const [autoReconnect, setAutoReconnect] = useState(false);
  const [connectedAt, setConnectedAt] = useState(null);
  const [protocols, setProtocols] = useState('');
  const [showSamples, setShowSamples] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { copied, copyToClipboard } = useCopyToClipboard();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg].slice(-500));
    scrollToBottom();
  }, [scrollToBottom]);

  const handleConnect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState < 2) {
      wsRef.current.close();
      return;
    }

    try {
      const protocolsArr = protocols.trim() ? protocols.split(',').map((p) => p.trim()).filter(Boolean) : undefined;
      const ws = protocolsArr ? new WebSocket(url, protocolsArr) : new WebSocket(url);

      ws.onopen = () => {
        setConnectionState(1);
        setConnectedAt(Date.now());
        addMessage({ id: generateId(), type: 'system', text: `Connected to ${url}`, time: new Date().toISOString() });
      };

      ws.onmessage = (event) => {
        let text = event.data;
        let isJson = false;
        try { JSON.parse(text); isJson = true; } catch { /* not JSON */ }
        addMessage({
          id: generateId(),
          type: 'received',
          text,
          isJson,
          size: new Blob([text]).size,
          time: new Date().toISOString(),
        });
      };

      ws.onerror = () => {
        addMessage({ id: generateId(), type: 'error', text: 'Connection error occurred', time: new Date().toISOString() });
      };

      ws.onclose = (event) => {
        setConnectionState(3);
        setConnectedAt(null);
        addMessage({
          id: generateId(),
          type: 'system',
          text: `Disconnected (code: ${event.code}${event.reason ? ', reason: ' + event.reason : ''})`,
          time: new Date().toISOString(),
        });
        if (autoReconnect && event.code !== 1000) {
          setTimeout(() => handleConnect(), 3000);
        }
      };

      wsRef.current = ws;
      setConnectionState(0);
    } catch (err) {
      addMessage({ id: generateId(), type: 'error', text: `Failed to connect: ${err.message}`, time: new Date().toISOString() });
    }
  }, [url, protocols, autoReconnect, addMessage]);

  const handleSend = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== 1 || !message.trim()) return;
    wsRef.current.send(message);
    addMessage({
      id: generateId(),
      type: 'sent',
      text: message,
      size: new Blob([message]).size,
      time: new Date().toISOString(),
    });
    setMessage('');
  }, [message, addMessage]);

  const handleDisconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close(1000);
    };
  }, []);

  const isConnected = connectionState === 1;
  const isConnecting = connectionState === 0;
  const stateInfo = WS_STATES[connectionState];
  const sentCount = messages.filter((m) => m.type === 'sent').length;
  const receivedCount = messages.filter((m) => m.type === 'received').length;

  const formatMsgText = (text) => {
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="section-card animate-fade-in overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Radio size={16} className="text-primary" />
            WebSocket Tester
            <span className={`badge ${stateInfo.badge} badge-xs gap-1`}>
              {isConnected ? <PlugZap size={9} /> : <Plug size={9} />}
              {stateInfo.label}
            </span>
          </h3>
          <div className="flex items-center gap-2">
            {isConnected && connectedAt && (
              <span className="text-[10px] opacity-40 flex items-center gap-1">
                <Clock size={10} /> {formatDuration(Date.now() - connectedAt)}
              </span>
            )}
            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="btn btn-ghost btn-xs rounded-lg">
              <X size={14} />
            </motion.button>
          </div>
        </div>

        {/* URL Bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="wss://echo.websocket.org"
              className="input input-sm font-mono text-xs w-full rounded-xl pr-8"
              onKeyDown={(e) => e.key === 'Enter' && !isConnected && handleConnect()}
              disabled={isConnected || isConnecting}
            />
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-40 hover:opacity-100"
              title="Sample URLs"
            >
              ▾
            </button>
          </div>
          <button
            onClick={isConnected ? handleDisconnect : handleConnect}
            disabled={isConnecting}
            className={`btn btn-sm gap-1.5 rounded-xl shrink-0 ${isConnected ? 'btn-error' : 'btn-primary'}`}
          >
            {isConnecting ? (
              <span className="loading loading-spinner loading-xs" />
            ) : isConnected ? (
              <Plug size={14} />
            ) : (
              <PlugZap size={14} />
            )}
            {isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        </div>

        {/* Sample URLs dropdown */}
        <AnimatePresence>
          {showSamples && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-base-200/50 border border-base-300/50">
                {SAMPLE_URLS.map((s) => (
                  <button
                    key={s.url}
                    onClick={() => { setUrl(s.url); setShowSamples(false); }}
                    className="btn btn-ghost btn-xs rounded-lg"
                    disabled={isConnected}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options row */}
        <div className="flex items-center gap-3 mb-4 text-xs flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoReconnect}
              onChange={(e) => setAutoReconnect(e.target.checked)}
              className="checkbox checkbox-xs checkbox-primary"
            />
            <span className="opacity-60">Auto-reconnect</span>
          </label>
          <div className="flex items-center gap-1.5">
            <span className="opacity-40">Protocols:</span>
            <input
              type="text"
              value={protocols}
              onChange={(e) => setProtocols(e.target.value)}
              placeholder="optional"
              className="input input-xs w-32 rounded-lg font-mono"
              disabled={isConnected}
            />
          </div>
          {messages.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="opacity-40">↑{sentCount} ↓{receivedCount}</span>
              <button onClick={() => setMessages([])} className="btn btn-ghost btn-xs text-error rounded-lg gap-1">
                <Trash2 size={10} /> Clear
              </button>
            </div>
          )}
        </div>

        {/* Messages area */}
        <div className="rounded-xl bg-base-200/60 border border-base-300/50 mb-4 overflow-hidden">
          <div className="max-h-[350px] min-h-[200px] overflow-y-auto scrollbar-thin p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Radio size={28} className="mx-auto opacity-15 mb-2" />
                <p className="text-xs opacity-40">Connect to a WebSocket server to start</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'system' || msg.type === 'error' ? (
                    <div className={`text-center w-full py-1.5 text-[10px] font-mono ${msg.type === 'error' ? 'text-error' : 'opacity-40'}`}>
                      — {msg.text} —
                    </div>
                  ) : (
                    <div className={`max-w-[80%] group ${msg.type === 'sent' ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-1.5 mb-0.5 text-[9px] opacity-40">
                        {msg.type === 'sent' ? (
                          <><ArrowUpRight size={9} /> Sent</>
                        ) : (
                          <><ArrowDownLeft size={9} /> Received</>
                        )}
                        <span>{new Date(msg.time).toLocaleTimeString()}</span>
                        {msg.size && <span>({msg.size} B)</span>}
                        <button
                          onClick={() => copyToClipboard(msg.text)}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity ${copied ? 'text-success' : ''}`}
                          title="Copy"
                        >
                          {copied ? <Check size={9} /> : <Copy size={9} />}
                        </button>
                      </div>
                      <div className={`inline-block px-3 py-2 rounded-xl text-xs font-mono whitespace-pre-wrap break-all max-h-40 overflow-auto scrollbar-thin ${
                        msg.type === 'sent'
                          ? 'bg-primary/15 border border-primary/20 text-primary-content'
                          : 'bg-base-100 border border-base-300'
                      }`}>
                        {msg.isJson ? formatMsgText(msg.text) : msg.text}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Send bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isConnected ? 'Type a message...' : 'Connect to a server first'}
              className="textarea font-mono text-xs w-full rounded-xl min-h-[60px] max-h-[120px]"
              disabled={!isConnected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          <div className="flex sm:flex-col gap-1.5 shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSend}
              disabled={!isConnected || !message.trim()}
              className="btn btn-primary btn-sm gap-1.5 rounded-xl flex-1"
            >
              <Send size={13} /> Send
            </motion.button>
            {/* Quick messages */}
            <div className="dropdown dropdown-top dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-xs rounded-xl text-[10px] w-full">
                Quick ▾
              </div>
              <ul tabIndex={0} className="dropdown-content z-50 menu p-1.5 shadow-lg bg-base-100 rounded-xl border border-base-300 w-48 mb-1">
                {SAMPLE_MESSAGES.map((s) => (
                  <li key={s.label}>
                    <button
                      onClick={() => setMessage(s.msg)}
                      className="text-xs rounded-lg"
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
