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

  servers: defineTable({
    // the default channel id will be created after the server is created
    name: v.string(),
    ownerId: v.id("users"), //the user who owns the server
    iconId: v.optional(v.id("_storage")), //the image icon of the server
    defaultChannelId: v.optional(v.id("channels")), //the default channel of the server (the general channel)
  }),
  channels: defineTable({
    name: v.string(),
    serverId: v.id("servers"), //the server the channel belongs to
  }).index("by_serverId", ["serverId"]), // look up channels by server id
  serverMembers: defineTable({
    serverId: v.id("servers"),
    userId: v.id("users"),
  })
    .index("by_serverId", ["serverId"]) // look up members by server id
    .index("by_userId", ["userId"]) // look up members by user id
    .index("by_serverId_userId", ["serverId", "userId"]), // verify user is a member of the server
  invites: defineTable({
    serverId: v.id("servers"), // the server the invite is for
    expiresAt: v.optional(v.number()), // the time the invite expires (undefined if it never expires)
    maxUses: v.optional(v.number()), // the maximum number of times the invite can be used
    uses: v.number(), // the number of times the invite has been used
  }),

  messages: defineTable({
    sender: v.id("users"),
    content: v.string(),
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")), // the id of the direct message or channel the message belongs to
    attachment: v.optional(v.id("_storage")), //user can attach a file/image to the message
    // _storage is a storage id provided by convex
    // optional is used to define a field that may or may not be present
  }).index("by_dmOrChannelId", ["dmOrChannelId"]), // look up messages by direct message id
  // add a table for typing indicators (know when user already has a typing indicator/is typing in a chat)
  typingIndicators: defineTable({
    user: v.id("users"),
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
    expiresAt: v.number(),
  })
    .index("by_dmOrChannelId", ["dmOrChannelId"]) // fetch EVERYONE currently typing for that message thread
    .index("by_user_dmOrChannelId", ["user", "dmOrChannelId"]), //fetch if specific user is typing in that message thread
});
