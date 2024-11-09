import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { CheckIcon, Icon, MessageCircleIcon, X, XIcon } from "lucide-react";

const useTestUsers = () => {
  const user = useQuery(api.functions.user.get); // get current user

  if (!user) {
    return [];
  }

  return [user, user, user, user];
};
export function PendingFriendsList() {
  const users = useTestUsers();

  return (
    <div className="flex flex-col divide-y">
      <h2 className="text-sm text-muted-foreground p-2.5">Pending Friends</h2>
      {users.map((user, index) => (
        <FriendItem key={index} username={user.username} image={user.image}>
          <IconButton
            className="bg-green-100"
            title="Accept Friend"
            icon={<CheckIcon />}
          />
          <IconButton
            className="bg-red-100"
            title="Reject Friend"
            icon={<XIcon />}
          />
        </FriendItem>
      ))}
    </div>
  );
}

export function AcceptedFriendsList() {
  const users = useTestUsers();

  return (
    <div className="flex flex-col divide-y">
      <h2 className="text-sm text-muted-foreground p-2.5">Accepted Friends</h2>
      {users.map((user, index) => (
        <FriendItem key={index} username={user.username} image={user.image}>
          <IconButton title="Start DM" icon={<MessageCircleIcon />} />
          <IconButton
            className="bg-red-100"
            title="Remove Friend"
            icon={<XIcon />}
          />
        </FriendItem>
      ))}
    </div>
  );
}

function IconButton({
  title,
  className,
  icon,
}: {
  title: string;
  className?: string;
  icon: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn("rounded-full", className)}
          variant="outline"
          size="icon"
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
