import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

const SUGGESTIONS = [
  'What pallet types do you offer?',
  'Where is my order?',
  'Which pallet is best for heavy loads?',
  'Suggest a pallet for cold storage',
  'What is the price of Euro Pallet?',
  'Can I request a custom size?',
  'Do you deliver to Chennai?',
];

function getBotResponse(message) {
  const msg = message.toLowerCase();
  const words = msg.replace(/[?.,!]/g, '').split(/\s+/);

  const keywords = {
    greeting: ['hello', 'hi', 'hey'],
    order: ['order', 'tracking', 'shipment'],
    types: ['types', 'offer', 'products', 'varieties'],
    heavy: ['heavy', 'strong', 'load', 'loads'],
    cold: ['cold', 'freezing', 'temperature', 'storage'],
    price: ['price', 'cost', 'rate', 'quotation'],
    delivery: ['deliver', 'shipping', 'location', 'city'],
    custom: ['custom', 'size', 'dimension', 'build'],
    contact: ['contact', 'support', 'help'],
  };

  const responses = {
    greeting: 'Hello! I am your Pallet Assistant. How can I help you today?',
    order: 'To check your order status, please provide your order ID or visit the Quotation page.',
    types: 'We offer Euro Pallets, Standard Pallets, Custom Pallets, and Heavy Duty Pallets.',
    heavy: 'For heavy loads, we recommend our Heavy Duty Pallet or Euro Pallet (1200×800mm).',
    cold: 'For cold storage, pallets made from plastic or treated wood are ideal.',
    price: 'Prices vary based on type and quantity. Visit the Quotation section for an accurate estimate.',
    delivery: 'Yes, we deliver across India including Chennai, Bangalore, and more!',
    custom: 'Absolutely! You can request custom pallets via the Quotation form.',
    contact: 'You can reach us through the Contact Us page or call our support team.',
  };

  // Prioritize whole-word matching
  for (const key in keywords) {
    if (keywords[key].some(keyword => words.includes(keyword))) {
      return responses[key];
    }
  }

  // Fallback to substring matching for broader cases
  for (const key in keywords) {
    if (keywords[key].some(word => msg.includes(word))) {
      return responses[key];
    }
  }

  return 'I can help you with pallet types, orders, pricing, and more. Try asking about delivery, prices, or custom sizes!';
}

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! I am your Pallet Assistant. How can I help you today?' }
  ]);
  const [iconHover, setIconHover] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = (msg) => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: getBotResponse(msg) }]);
    }, 600);
    setInput('');
  };

  return (
    <>
      {/* Online Bubble */}
      {!open && (
        <div
          style={{
            position: 'fixed',
            bottom: 62,
            right: 100,
            background: '#fff',
            color: '#232b39',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
            padding: '16px 26px',
            fontSize: 16,
            zIndex: 1000,
            minWidth: 240,
            fontWeight: 500,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
            opacity: iconHover ? 1 : 0.85,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            border: '1px solid #eee',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 17 }}>We're Online!</span>
          <span style={{ color: '#888', fontWeight: 400, fontSize: 15, marginTop: 2 }}>How may I help you today?</span>
        </div>
      )}
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setIconHover(true)}
        onMouseLeave={() => setIconHover(false)}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
          background: '#FFD600',
          color: '#232b39',
          border: 'none',
          borderRadius: '50%',
          width: 60,
          height: 60,
          boxShadow: iconHover ? '0 4px 24px 0 #FFD60088' : '0 2px 12px rgba(0,0,0,0.18)',
          cursor: 'pointer',
          transform: iconHover ? 'scale(1.12)' : 'scale(1)',
          transition: 'box-shadow 0.2s, transform 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Toggle chatbot"
      >
        {open ? <X size={32} /> : <MessageSquare size={32} />}
      </button>
      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 110,
            right: 32,
            width: 340,
            height: 'min(70vh, 600px)',
            maxWidth: '90vw',
            background: '#232b39',
            color: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ background: '#FFD600', color: '#232b39', padding: '1rem', fontWeight: 700, fontSize: 18 }}>
            Pallet Chatbot
          </div>
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#232b39', minHeight: 0 }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                marginBottom: 12,
                textAlign: msg.from === 'user' ? 'right' : 'left',
              }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: msg.from === 'user' ? '#2563eb' : '#31394a',
                    color: '#fff',
                    borderRadius: 12,
                    padding: '8px 14px',
                    maxWidth: '80%',
                    fontSize: 15,
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ borderTop: '1px solid #31394a', background: '#232b39', padding: '0.5rem 1rem' }}>
            <form
              onSubmit={e => {
                e.preventDefault();
                sendMessage(input);
              }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 15,
                  background: '#31394a',
                  color: '#fff',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#FFD600',
                  color: '#232b39',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0 18px',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </form>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: '#31394a',
                    color: '#FFD600',
                    border: 'none',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
