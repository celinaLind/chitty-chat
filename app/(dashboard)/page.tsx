"use client";
import { Button } from "@/components/ui/button";
import {
  PendingFriendsList,
  AcceptedFriendsList,
} from "./_components/friends-list";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function FriendsPage() {
  return (
    // flex-1 takes up the remaining space
    // flex-col stacks the children vertically
    // flex divides the children into rows
    // divide-y adds a vertical divider between the children
    <div className="flex-1 flex-col flex divide-y">
      <header className="flex items-center justify-between p-4">
        <h1 className="font-semibold">Friends</h1>
        <Button>Add Friend</Button>
      </header>
      {/* tag below created with following command "div.grid.p-4.gap-4" */}
      <div className="grid p-4 gap-4">
        <TooltipProvider delayDuration={0}>
          <PendingFriendsList />
          <AcceptedFriendsList />
        </TooltipProvider>
      </div>
    </div>
  );
}
