import { v } from "convex/values";
import {
  assertServerMember,
  assertServerOwner,
  authenticatedMutation,
  authenticatedQuery,
} from "./helpers";

// return all channels for server
export const list = authenticatedQuery({
  args: {
    id: v.id("servers"),
  },
  handler: async (ctx, { id }) => {
    await assertServerMember(ctx, id);
    const channels = await ctx.db
      .query("channels")
      .withIndex("by_serverId", (q) => q.eq("serverId", id))
      .collect();
    //do not need to filter/change since channels object houses all the information we need
    return channels;
  },
});

// get a channel
export const get = authenticatedQuery({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, { id }) => {
    const channel = await ctx.db.get(id);
    if (!channel) {
      throw new Error("Channel not found");
    }
    await assertServerMember(ctx, channel.serverId);
    return channel;
  },
});

// create a channel
export const create = authenticatedMutation({
  args: {
    serverId: v.id("servers"),
    name: v.string(),
  },
  handler: async (ctx, { serverId, name }) => {
    await assertServerOwner(ctx, serverId);
    const existingChannel = await ctx.db
      .query("channels")
      .withIndex("by_serverId_name", (q) =>
        q.eq("serverId", serverId).eq("name", name)
      )
      .unique();

    if (existingChannel) {
      throw new Error("Channel already exists");
    }

    // if channel does not exist, create a new channel
    const channelId = await ctx.db.insert("channels", { name, serverId });
    return channelId;
  },
});

// delete channel
export const remove = authenticatedMutation({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, { id }) => {
    const channel = await ctx.db.get(id);
    if (!channel) {
      throw new Error("Channel not found");
    }
    const server = await ctx.db.get(channel.serverId);
    if (!server) {
      throw new Error("Server not found");
    } else if (server.ownerId !== ctx.user._id) {
      throw new Error("You are not the owner of this server");
    } else if (channel._id === server.defaultChannelId) {
      throw new Error("Cannot delete the default channel");
    }
    await ctx.db.delete(id);
  },
});
