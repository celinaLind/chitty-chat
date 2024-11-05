"use client";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
// by default typescript tries to run the code in the server
// 'use client' tells typescript to run the code in the client
// this is needed whenever you have interactive code that uses the DOM (Document Object Model)

import { useState } from "react";

export default function Home() {
  const messages = useQuery(api.functions.message.list);
  const createMessage = useMutation(api.functions.message.create);
  const [input, setInput] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // prevent the form from submitting and refreshing the page
    event.preventDefault();
    // set messages to all existing messages plus the new message
    createMessage({ sender: "Alice", content: input });
    // clear the input field
    setInput("");
  };

  return (
    <div>
      {messages?.map((message, index) => (
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
