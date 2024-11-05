import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
// query is a function that fetches data
// mutation is a function that modifies data

export const list = query({
  // ctx is the context object that contains the database
  handler: async (ctx) => {
    // return all the messages from the database
    return await ctx.db.query("messages").collect();
  },
});

export const create = mutation({
  args: {
    sender: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { sender, content }) => {
    await ctx.db.insert("messages", { sender, content });
  },
});
