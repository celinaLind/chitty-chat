import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function ServerMembers({ id }: { id: Id<"servers"> }) {
  const members = useQuery(api.functions.server.members, { id });
  return (
    <div className="flex flex-col max-w-80 w-full border-l p-4 bg-muted">
      {members?.map((member) => (
        <div key={member._id} className="flex items-center gap-2 p-2">
          <Avatar className="size-8 border">
            <AvatarImage src={member.image} />
            <AvatarFallback>{member.username[0]}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium">{member.username}</p>
        </div>
      ))}
    </div>
  );
}
