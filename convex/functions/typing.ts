import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import {
  assertChannelMember,
  authenticatedMutation,
  authenticatedQuery,
} from "./helpers";
import { internal } from "../_generated/api";

// list all users typing in the current direct message
export const list = authenticatedQuery({
  args: {
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
  },
  handler: async (ctx, { dmOrChannelId }) => {
    await assertChannelMember(ctx, dmOrChannelId);
    const usersWithTypingIndicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_dmOrChannelId", (q) =>
        q.eq("dmOrChannelId", dmOrChannelId)
      )
      .filter((q) => q.neq(q.field("user"), ctx.user._id)) // exclude the current user
      .collect();

    //   fetch usernames of users typing in the current direct message
    return await Promise.all(
      usersWithTypingIndicators.map(async (indicator) => {
        const user = await ctx.db.get(indicator.user);
        if (!user) {
          throw new Error("User does not exist");
        }
        // all users connected with a valid username vise versa
        return user.username; // return an array of usernames
      })
    );
  },
});

// update expiration date if user is still typing
export const upsert = authenticatedMutation({
  args: {
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
  },
  handler: async (ctx, { dmOrChannelId }) => {
    await assertChannelMember(ctx, dmOrChannelId);
    // does user already have a typing indicator?
    const existing = await ctx.db
      .query("typingIndicators") // why is the by_user_dmOrChannelId index an issue?
      .withIndex("by_user_dmOrChannelId", (q) =>
        q.eq("user", ctx.user._id).eq("dmOrChannelId", dmOrChannelId)
      )
      .unique(); // use unique b/c there is only one typing indicator per user per direct message

    const expiresAt = Date.now() + 5000; // 5 seconds from now

    // if user already has a typing indicator, update expiration date
    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt });
    } else {
      // if user does not have a typing indicator, create one
      await ctx.db.insert("typingIndicators", {
        user: ctx.user._id,
        dmOrChannelId,
        expiresAt,
      });
    }
    // schedule the remove function to run at the expiration time
    await ctx.scheduler.runAt(expiresAt, internal.functions.typing.remove, {
      dmOrChannelId,
      user: ctx.user._id,
      expiresAt,
    });
  },
});

// delete typing indicator if user is no longer typing and indicator has expired
export const remove = internalMutation({
  args: {
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
    user: v.id("users"),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { dmOrChannelId, user, expiresAt }) => {
    // confirm that the typing indicator exists
    // && that expected expiration date matches the one in the database
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_user_dmOrChannelId", (q) =>
        q.eq("user", user).eq("dmOrChannelId", dmOrChannelId)
      )
      .unique();
    if (existing && (!expiresAt || existing.expiresAt === expiresAt)) {
      await ctx.db.delete(existing._id);
    }
  },
});
