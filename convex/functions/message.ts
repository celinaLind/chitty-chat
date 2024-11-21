import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import {
  assertMember,
  authenticatedMutation,
  authenticatedQuery,
} from "./helpers";
import { internal } from "../_generated/api";
// query is a function that fetches data
// mutation is a function that modifies data

export const list = authenticatedQuery({
  args: {
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
  },
  // ctx is the context object that contains the database
  handler: async (ctx, { dmOrChannelId }) => {
    // before getting messages verify user is a member
    await assertMember(ctx, dmOrChannelId);
    // for each message return image, username, and content
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_dmOrChannelId", (q) =>
        q.eq("dmOrChannelId", dmOrChannelId)
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
    attachment: v.optional(v.id("_storage")),
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
  },
  handler: async (ctx, { content, attachment, dmOrChannelId }) => {
    await assertMember(ctx, dmOrChannelId);
    await ctx.db.insert("messages", {
      content,
      attachment,
      dmOrChannelId,
      sender: ctx.user._id,
    });
    // remove typing indicator RIGHT AFTER after message is sent
    await ctx.scheduler.runAfter(0, internal.functions.typing.remove, {
      dmOrChannelId,
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
