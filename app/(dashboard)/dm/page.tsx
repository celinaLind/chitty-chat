"use client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AddFriend } from "./_components/add-friend";
import {
  AcceptedFriendsList,
  PendingFriendsList,
} from "./_components/friends-list";

export default function FriendsPage() {
  return (
    // flex-1 takes up the remaining space
    // flex-col stacks the children vertically
    // flex divides the children into rows
    // divide-y adds a vertical divider between the children
    <div className="flex-1 flex-col flex divide-y">
      <header className="flex items-center justify-between p-4">
        <h1 className="font-semibold">Friends</h1>
        <AddFriend />
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
