import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { CheckIcon, Icon, MessageCircleIcon, X, XIcon } from "lucide-react";

export function PendingFriendsList() {
  const friends = useQuery(api.functions.friend.listPending);
  const updateStatus = useMutation(api.functions.friend.updateStatus);

  return (
    <div className="flex flex-col divide-y">
      <h2 className="text-xs font-medium text-muted-foreground p-2.5">
        Pending Friends
      </h2>
      {friends?.length === 0 && (
        <FriendsListEmpty>
          You have no pending friend requests.
        </FriendsListEmpty>
      )}
      {friends?.map((friend, index) => (
        <FriendItem
          key={index}
          username={friend.user.username}
          image={friend.user.image}
        >
          <IconButton
            className="bg-green-100"
            title="Accept"
            icon={<CheckIcon />}
            onClick={() => updateStatus({ id: friend._id, status: "accepted" })}
          />
          <IconButton
            className="bg-red-100"
            title="Reject"
            icon={<XIcon />}
            onClick={() => updateStatus({ id: friend._id, status: "rejected" })}
          />
        </FriendItem>
      ))}
    </div>
  );
}

export function AcceptedFriendsList() {
  const friends = useQuery(api.functions.friend.listAccepted);
  const updateStatus = useMutation(api.functions.friend.updateStatus);

  return (
    <div className="flex flex-col divide-y">
      <h2 className="text-xs font-medium text-muted-foreground p-2.5">
        Accepted Friends
      </h2>
      {friends?.length === 0 && (
        <FriendsListEmpty>You have no friends yet.</FriendsListEmpty>
      )}
      {friends?.map((friend, index) => (
        <FriendItem
          key={index}
          username={friend.user.username}
          image={friend.user.image}
        >
          <IconButton
            title="Start DM"
            icon={<MessageCircleIcon />}
            onClick={() => {}}
          />
          <IconButton
            className="bg-red-100"
            title="Remove Friend"
            icon={<XIcon />}
            onClick={() => updateStatus({ id: friend._id, status: "rejected" })}
            // when you remove a friend it doesn't delete the friend from the database,
            // it just changes the status to rejected
          />
        </FriendItem>
      ))}
    </div>
  );
}

function FriendsListEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 bg-muted/50 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function IconButton({
  title,
  className,
  icon,
  onClick,
}: {
  title: string;
  className?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn("rounded-full", className)}
          variant="outline"
          size="icon"
          onClick={onClick}
        >
          {icon}
          <span className="sr-only">{title}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
}

function FriendItem({
  username,
  image,
  children,
}: {
  username: string;
  image: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 gap-2.5">
      <div className="flex items-center gap-2.5">
        <Avatar className="size-9 border">
          <AvatarImage src={image} />
          <AvatarFallback />
        </Avatar>
        <p className="text-sm font-medium">{username}</p>
      </div>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}
