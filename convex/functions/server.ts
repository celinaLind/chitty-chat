import { v } from "convex/values";
import {
  assertServerMember,
  authenticatedMutation,
  authenticatedQuery,
} from "./helpers";

// get a list of all the servers the current user is a member of
export const list = authenticatedQuery({
  handler: async (ctx) => {
    // fetch all server ids then filter ones that the current user is a member of
    const serverMembers = await ctx.db
      .query("serverMembers")
      .withIndex("by_userId", (q) => q.eq("userId", ctx.user._id))
      .collect(); // returns ALL servers gathered
    // get name and icon for each server
    const servers = await Promise.all(
      serverMembers.map(async ({ serverId }) => {
        const server = await ctx.db.get(serverId);
        if (!server) return null;
        // server would only have the iconId not the url we need to use
        // we need to spread out the return value
        // and add an iconUrl property to use
        return {
          ...server,
          iconUrl: server.iconId
            ? await ctx.storage.getUrl(server?.iconId)
            : null,
        };
      })
    );
    // return all servers that aren't null
    return servers.filter((server) => server !== null);
  },
});

// fetch a single server by its id
export const get = authenticatedQuery({
  args: {
    id: v.id("servers"),
  },
  handler: async (ctx, { id }) => {
    await assertServerMember(ctx, id);
    return await ctx.db.get(id);
  },
});

// return all channels for server
export const channels = authenticatedQuery({
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

// list out members of channel
export const members = authenticatedQuery({
  args: {
    id: v.id("servers"),
  },
  handler: async (ctx, { id }) => {
    await assertServerMember(ctx, id);
    // fetch all the members of the server
    const serverMembers = await ctx.db
      .query("serverMembers")
      .withIndex("by_serverId", (q) => q.eq("serverId", id))
      .collect();
    // then fetch the user objects
    const users = await Promise.all(
      serverMembers.map(async ({ userId }) => {
        return await ctx.db.get(userId);
      })
    );
    return users.filter((user) => user !== null);
  },
});

// define a new mutation to create a server
export const create = authenticatedMutation({
  args: {
    name: v.string(),
    iconId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { name, iconId }) => {
    // insert a new server into the database
    const serverId = await ctx.db.insert("servers", {
      name,
      iconId,
      ownerId: ctx.user._id,
    });

    // create default channel for the server we created above
    const defaultChannelId = await ctx.db.insert("channels", {
      name: "general",
      serverId,
    });

    await ctx.db.patch(serverId, {
      defaultChannelId,
    });

    // add current user as member of this server/channel
    await ctx.db.insert("serverMembers", {
      serverId,
      userId: ctx.user._id,
    });

    //use this information on frontend to redirect user to their server/channel
    return { serverId, defaultChannelId };
  },
});
