import { api } from "@/convex/_generated/api";
import {
  LiveKitRoom,
  PreJoin,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { PhoneIcon } from "lucide-react";
import { useState } from "react";

export function Voice({ serverId }: { serverId: Id<"servers"> }) {
  const token = useQuery(api.functions.livekit.getToken, { serverId });
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton>
          <PhoneIcon />
          Voice
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="max-w-screen-lg">
        <DialogTitle className="sr-only">Voice</DialogTitle>
        <LiveKitRoom
          serverUrl="wss://chitty-chat-ibl8xlrg.livekit.cloud"
          token={token}
          onDisconnected={() => setOpen(false)}
          //   data-lk-theme="default" // default theme
        >
          <VideoConference />
        </LiveKitRoom>
      </DialogContent>
    </Dialog>
  );
}
