import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs"; // import the useAuth hook from Clerk
// useAuth is a hook that gives us access to the user's session

const client = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// this provider will allow us to use the client in our app
export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
