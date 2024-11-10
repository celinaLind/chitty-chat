import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { authenticatedMutation, authenticatedQuery } from "./helpers";

// fetch all dms you are a member of
export const list = authenticatedQuery({
  handler: async (ctx) => {
    const directMessages = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_user", (q) => q.eq("user", ctx.user._id))
      .collect();

    return await Promise.all(
      directMessages.map((dm) => getDirectMessage(ctx, dm.directMessage))
    );
  },
});

// return dm and name of user in dm
export const get = authenticatedQuery({
  args: {
    id: v.id("directMessages"),
  },
  handler: async (ctx, { id }) => {
    // first verify if the user is a member of the direct message
    const member = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_direct_message_user", (q) =>
        q.eq("directMessage", id).eq("user", ctx.user._id)
      ) // verifies if direct message id and user id are correct and connected in the directMessageMembers table
      .first();
    if (!member) {
      throw new Error("You are not a member of this direct message");
    }
    return await getDirectMessage(ctx, id);
  },
});

export const create = authenticatedMutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (!user) {
      throw new Error("User not found");
    }
    const directMessagesForCurrentUser = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_user", (q) => q.eq("user", ctx.user._id))
      .collect();

    const directMessagesForOtherUser = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_user", (q) => q.eq("user", user._id))
      .collect();

    // find the direct message that both users are members of
    const directMessage = directMessagesForCurrentUser.find((dm) =>
      directMessagesForOtherUser.find(
        (dm2) => dm.directMessage === dm2.directMessage
      )
    );

    if (directMessage) {
      return directMessage.directMessage; // return the direct message id if it already exists
    }
    // create a new direct message if one does not exist
    const newDirectMessage = await ctx.db.insert("directMessages", {});
    // add both users as members of the new direct message
    await Promise.all([
      // add current user as member of the direct message
      ctx.db.insert("directMessageMembers", {
        user: ctx.user._id,
        directMessage: newDirectMessage,
      }),
      // add other user as member of the direct message
      ctx.db.insert("directMessageMembers", {
        user: user._id,
        directMessage: newDirectMessage,
      }),
    ]);
    return newDirectMessage; // return the new direct message id
  },
});

const getDirectMessage = async (
  ctx: QueryCtx & { user: Doc<"users"> },
  id: Id<"directMessages">
) => {
  const dm = await ctx.db.get(id);
  if (!dm) {
    throw new Error("Direct message not found");
  }
  const otherMember = await ctx.db
    .query("directMessageMembers")
    .withIndex("by_direct_message", (q) => q.eq("directMessage", id))
    .filter((q) => q.neq(q.field("user"), ctx.user._id)) // gets the members of the direct message except the current user
    //   .collect(); // collect all members of the direct message
    .first(); // get the first member of the direct message that isn't the current user

  if (!otherMember) {
    throw new Error("Direct message has no other members");
  }

  const otherUser = await ctx.db.get(otherMember.user);
  if (!otherUser) {
    throw new Error("Other member does not exist");
  }

  return { ...dm, otherUser };
};
