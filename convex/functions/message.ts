import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { internal } from "../_generated/api";
// query is a function that fetches data
// mutation is a function that modifies data

export const list = authenticatedQuery({
  args: {
    directMessage: v.id("directMessages"),
  },
  // ctx is the context object that contains the database
  handler: async (ctx, { directMessage }) => {
    // before getting messages verify user is a member
    const member = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_direct_message_user", (q) =>
        q.eq("directMessage", directMessage).eq("user", ctx.user._id)
      )
      .first();
    if (!member) {
      throw new Error("You are not a member of this direct message");
    }
    // for each message return image, username, and content
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_direct_message", (q) =>
        q.eq("directMessage", directMessage)
      )
      .collect();
    return Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.sender);
        const attachment = message.attachment
          ? await ctx.storage.getUrl(message.attachment)
          : undefined;
        return {
          ...message,
          attachment,
          sender,
        };
      })
    );
  },
});

export const create = authenticatedMutation({
  args: {
    content: v.string(),
    directMessage: v.id("directMessages"),
    attachment: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { content, attachment, directMessage }) => {
    const member = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_direct_message_user", (q) =>
        q.eq("directMessage", directMessage).eq("user", ctx.user._id)
      )
      .first();
    if (!member) {
      throw new Error("You are not a member of this direct message");
    }
    await ctx.db.insert("messages", {
      content,
      attachment,
      directMessage,
      sender: ctx.user._id,
    });
    // remove typing indicator RIGHT AFTER after message is sent
    await ctx.scheduler.runAfter(0, internal.functions.typing.remove, {
      directMessage,
      user: ctx.user._id,
    });
  },
});

// add ability to delete messages
export const remove = authenticatedMutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, { id }) => {
    const message = await ctx.db.get(id);
    if (!message) {
      // verify message exists
      throw new Error("Message not found");
    } else if (message.sender !== ctx.user._id) {
      // only allow the sender to delete the message
      throw new Error("You do not have permission to delete this message");
    }
    // delete the message
    await ctx.db.delete(id);
    if (message.attachment) {
      // if there is an attachment delete it from storage
      await ctx.storage.delete(message.attachment);
    }
  },
});

// generate Upload url for images
export const generateUploadUrl = authenticatedMutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// remove attachment from message
export const removeAttachment = authenticatedMutation({
  args: {
    attachment: v.id("_storage"),
  },
  handler: async (ctx, { attachment }) => {
    // const thisAttachment = await ctx.storage.getUrl(attachment);
    if (!attachment) {
      throw new Error("Attachment not found");
    }
    await ctx.storage.delete(attachment);
    // return thisAttachment;
  },
});
