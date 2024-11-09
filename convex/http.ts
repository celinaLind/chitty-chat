import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  method: "POST",
  path: "/clerk-webhook",
  handler: httpAction(async (ctx, req) => {
    const body = await validateRequest(req);
    if (!body) {
      // if no body return unauthorized
      return new Response("Unauthorized", { status: 401 });
    }
    switch (body.type) {
      case "user.created":
        // the database is not directly accessible here
        // have to create a separate mutation in the functions folder
        await ctx.runMutation(internal.functions.user.upsert, {
          username: body.data.username!,
          image: body.data.image_url,
          clerkId: body.data.id,
        });
        break;
      case "user.updated":
        // handle user updated event
        await ctx.runMutation(internal.functions.user.upsert, {
          username: body.data.username!,
          image: body.data.image_url,
          clerkId: body.data.id,
        });
        break;
      case "user.deleted":
        // handle user deleted event
        if (body.data.id) {
          await ctx.runMutation(internal.functions.user.remove, {
            clerkId: body.data.id,
          });
        }
        break;
    }
    return new Response("OK", { status: 200 });
  }),
});

const validateRequest = async (req: Request) => {
  // get headers from request
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  // get request content
  const text = await req.text();

  // verify webhook
  try {
    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    // confirms each detail of webhook is correct
    return webhook.verify(text, {
      "svix-id": svix_id!,
      "svix-timestamp": svix_timestamp!,
      "svix-signature": svix_signature!,
    }) as unknown as WebhookEvent;
  } catch (error) {
    return null;
  }
};

export default http;
