import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { authenticatedMutation, authenticatedQuery } from "./helpers";

export const listPending = authenticatedQuery({
  handler: async (ctx) => {
    const friends = await ctx.db
      .query("friends")
      .withIndex("by_user2_status", (q) =>
        q.eq("user2", ctx.user._id).eq("status", "pending")
      )
      // looking for friends where the you are the user2 and the status is pending
      .collect();

    return mapWithUsers(ctx, friends, "user1");
  },
});

// listAccepted will return all friends where the status is accepted where current user is either user1 or user2
export const listAccepted = authenticatedQuery({
  handler: async (ctx) => {
    const friends1 = await ctx.db
      .query("friends")
      .withIndex("by_user1_status", (q) =>
        q.eq("user1", ctx.user._id).eq("status", "accepted")
      )
      .collect();
    const friends2 = await ctx.db
      .query("friends")
      .withIndex("by_user2_status", (q) =>
        q.eq("user2", ctx.user._id).eq("status", "accepted")
      )
      .collect();
    const friendsWithUser1 = await mapWithUsers(ctx, friends1, "user2");
    const friendsWithUser2 = await mapWithUsers(ctx, friends2, "user1");
    return [...friendsWithUser1, ...friendsWithUser2];
  },
});

// update status of friend request
export const updateStatus = authenticatedMutation({
  args: {
    id: v.id("friends"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, { id, status }) => {
    const friend = await ctx.db.get(id);
    if (!friend) {
      throw new Error("Friend not found");
    }
    if (friend.user1 !== ctx.user._id && friend.user2 !== ctx.user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(id, { status });
  },
});

// create a friend request
export const createFriendRequest = authenticatedMutation({
  // look up user by username and if it exists, create a friend request
  args: {
    username: v.string(),
  },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique(); // this returns a single user object
    if (!user) {
      throw new Error("User not found");
    } else if (user._id === ctx.user._id) {
      throw new Error("Cannot add yourself as a friend");
    }
    await ctx.db.insert("friends", {
      user1: ctx.user._id, // the user sending the friend request (you)
      user2: user._id, // the user you are sending the friend request to
      status: "pending",
    });
  },
});

// a generic function with generic types that takes a key and an object where the key is the id of the user object
const mapWithUsers = async <
  K extends string,
  T extends { [key in K]: Id<"users"> },
>(
  ctx: QueryCtx,
  items: T[],
  key: K
) => {
  // return the actual user objects (user1) for each friend [or vice versa]
  // => this shows the friend you are waiting for a response from
  // allSettled is used to ensure that all promises are resolved
  const result = await Promise.allSettled(
    items.map(async (item) => {
      const user = await ctx.db.get(item[key]);
      if (!user) {
        throw new Error("User not found");
      }
      return {
        ...item,
        user,
      };
    })
  );
  // filter out the promises that were rejected and only return the resolved promises
  return result.filter((r) => r.status === "fulfilled").map((r) => r.value);
};
