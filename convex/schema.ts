// this file will define our tables and and the types for them for the data found in convex

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
// v is a helper object that contains validators for different types of data

export default defineSchema({
  users: defineTable({
    username: v.string(),
    image: v.string(),
    clerkId: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"]),
  friends: defineTable({
    // user1 is the user sending the friend request
    user1: v.id("users"), // it is a string type but verifies that the id is a valid user id
    // user2 is the user receiving the friend request
    user2: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    // union is used to define multiple types; in this case, the status can be either pending, accepted, or rejected
  })
    .index("by_user1_status", ["user1", "status"])
    .index("by_user2_status", ["user2", "status"]),
  directMessages: defineTable({}),
  // the directMessageMembers can be used if you want to make group chats later
  directMessageMembers: defineTable({
    user: v.id("users"),
    directMessage: v.id("directMessages"),
  })
    .index("by_direct_message", ["directMessage"])
    .index("by_user", ["user"])
    .index("by_direct_message_user", ["directMessage", "user"]), // able to find members by direct message id and/or user
  messages: defineTable({
    sender: v.id("users"),
    content: v.string(),
    directMessage: v.id("directMessages"),
  }).index("by_direct_message", ["directMessage"]), // look up messages by direct message id
  // add a table for typing indicators (know when user already has a typing indicator/is typing in a chat)
  typingIndicators: defineTable({
    user: v.id("users"),
    directMessage: v.id("directMessages"),
    expiresAt: v.number(),
  })
    .index("by_direct_message", ["directMessage"]) // fetch EVERYONE currently typing for that message thread
    .index("by_user_direct_message", ["user", "directMessage"]), //fetch if specific user is typing in that message thread
});
