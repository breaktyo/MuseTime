import React, { useEffect, useRef } from 'react';

export default function ChatBox({ guess, setGuess, messages, onSend }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto bg-white p-2 border rounded">
        {messages.map((msg, index) => {
          const isSystemGuess =
            msg.message.includes('has guessed the title') ||
            msg.message.includes('has guessed the artist');

          return (
            <div
              key={index}
              className={`break-words ${isSystemGuess ? 'text-green-600 font-semibold' : ''}`}
            >
              <span className="font-medium break-words">{msg.user}</span>: {msg.message}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <input
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        className="w-full p-2 border mt-2 rounded"
        placeholder="Type your guess..."
      />
    </div>
  );
}
