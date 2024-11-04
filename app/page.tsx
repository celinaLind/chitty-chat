"use client";
// by default typescript tries to run the code in the server
// 'use client' tells typescript to run the code in the client
// this is needed whenever you have interactive code that uses the DOM (Document Object Model)

import { useState } from "react";

// an interface is a way to define a type in TypeScript
interface Message {
  sender: string;
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "Alice", content: "Hello, Bob!" },
    { sender: "Bob", content: "Hi, Alice!" },
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // prevent the form from submitting and refreshing the page
    event.preventDefault();
    // set messages to all existing messages plus the new message
    setMessages([...messages, { sender: "Alice", content: input }]);
    // clear the input field
    setInput("");
  };

  return (
    <div>
      {messages.map((message, index) => (
        <div key={index}>
          <strong>{message.sender}</strong>: {message.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="message"
          id="message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
