import React from 'react';

export default function ChatBox({ guess, setGuess, messages, onSend }) {
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md">
      <div className="w-full h-40 overflow-y-auto bg-white p-2 border">
        {messages.map((msg, index) => (
          <div key={index}>{msg.user}: {msg.message}</div>
        ))}
      </div>
      <input
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSend()}
        className="w-full p-2 border"
        placeholder="Type your guess..."
      />
      <button onClick={onSend} className="p-2 bg-blue-500 text-white">Send</button>
    </div>
  );
}