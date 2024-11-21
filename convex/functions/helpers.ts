import {
  customQuery,
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { getCurrentUser } from "./user";
import { mutation, query, QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

export interface AuthenicatedQueryCtx extends QueryCtx {
  user: Doc<"users">;
}

export const authenticatedQuery = customQuery(
  query, // set base query as the base parameter
  customCtx(async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    return { user };
  })
);
// QUESTION: Are the base mutations and queries meant to come from the generated server file or the convex customFunctions?
// Answer: The base mutations and queries are meant to come from the generated server file. The customFunctions are used to add additional functionality to the base mutations and queries.

export const authenticatedMutation = customMutation(
  mutation, // set base mutation as the base parameter
  customCtx(async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    return { user };
  })
);

// confirm if it is a dm or channel
// check if the user is a member of the dm or channel
// An assertion is a fcn that checks if a condition is true and throws an error if it is not.
export const assertMember = async (
  ctx: AuthenicatedQueryCtx,
  dmOrChannelId: Id<"directMessages" | "channels">
) => {
  const dmOrChannel = await ctx.db.get(dmOrChannelId);
  if (!dmOrChannel) {
    throw new Error("Direct message or channel not found");
  } else if ("serverId" in dmOrChannel) {
    // this is a channel, so we need to check if the user is a member of the server
    const serverMembers = await ctx.db
      .query("serverMembers")
      .withIndex("by_serverId_userId", (q) =>
        q.eq("serverId", dmOrChannel.serverId).eq("userId", ctx.user._id)
      )
      .unique();
    if (!serverMembers) {
      throw new Error("You are not a member of this server");
    }
  } else {
    // this is a direct message, so we need to check if the user is a member of the direct message
    const dmMember = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_direct_message_user", (q) =>
        q.eq("directMessage", dmOrChannel._id).eq("user", ctx.user._id)
      )
      .unique();
    if (!dmMember) {
      throw new Error("You are not a member of this direct message");
    }
  }
};
