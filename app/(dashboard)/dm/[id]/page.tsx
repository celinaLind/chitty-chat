"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { MoreVerticalIcon, TrashIcon } from "lucide-react";
import { use } from "react";

export default function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // the params property is a promise meaning you will need to await it
  // or use(params)
  const { id } = use(params);
  const user = useQuery(api.functions.user.get);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col divide-y max-h-screen">
      <header className="flex items-center gap-2 p-4">
        <Avatar className="size-8 border">
          <AvatarImage src={user.image} />
          <AvatarFallback />
        </Avatar>
        <h1 className="font-semibold">{user.username}</h1>
      </header>
      {/* allow user to scroll through messages of the screen */}
      <ScrollArea className="h-full p-4">
        <MessageItem />
      </ScrollArea>
    </div>
  );
}
function MessageItem() {
  const user = useQuery(api.functions.user.get);
  return (
    <div className="flex items-center gap-2 px-4">
      <Avatar className="size-8 border">
        <AvatarImage src={user!.image} />
        <AvatarFallback />
      </Avatar>
      <div className="flex flex-col mr-auto">
        <p className="text-xs text-muted-foreground">{user!.username}</p>
        <p className="text-sm font-semibold">Hello!</p>
      </div>
      <MessageActions />
    </div>
  );
}

function MessageActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVerticalIcon className="size-4 text-muted-foreground" />
        <span className="sr-only">Message Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* text-destructive makes the text red */}
        <DropdownMenuItem className="text-destructive">
          <TrashIcon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
