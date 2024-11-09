// this file will define our tables and and the types for them for the data found in convex

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
// v is a helper object that contains validators for different types of data

export default defineSchema({
  users: defineTable({
    username: v.string(),
    image: v.string(),
    clerkId: v.string(),
  }).index("by_clerkId", ["clerkId"]),
  messages: defineTable({
    sender: v.string(),
    content: v.string(),
  }),
});
