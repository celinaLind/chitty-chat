import { authenticatedMutation } from "./helpers";

// generate Upload url for images
export const generateUploadUrl = authenticatedMutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
