import {
  customQuery,
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { getCurrentUser } from "./user";
import { mutation, query } from "../_generated/server";

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
