import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

export function CreateInvite({ serverId }: { serverId: Id<"servers"> }) {
  const [inviteId, setInviteId] = useState<Id<"invites"> | null>(null);
  const createInvite = useMutation(api.functions.invite.create);

  const handleSubmit = async (
    maxUses: number | undefined,
    expiresAt: number | undefined
  ) => {
    try {
      const inviteId = await createInvite({
        serverId,
        maxUses,
        expiresAt,
      });
      setInviteId(inviteId);
    } catch (error) {
      toast.error("Failed to create invite", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Create Invite
        </Button>
      </DialogTrigger>
      {inviteId ? (
        <CreatedInvite inviteId={inviteId} onClose={() => setInviteId(null)} />
      ) : (
        <CreateInviteForm onSubmit={handleSubmit} />
      )}
    </Dialog>
  );
}

const EXPIRES_AT_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "1 Hour", value: 60 * 60 },
  { label: "1 Day", value: 60 * 60 * 24 },
  { label: "1 Week", value: 60 * 60 * 24 * 7 },
  { label: "1 Month", value: 60 * 60 * 24 * 30 },
];

const MAX_USES_OPTIONS = [
  { label: "Unlimited", value: 0 },
  { label: "1", value: 1 },
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
];

function CreateInviteForm({
  onSubmit,
}: {
  onSubmit?: (
    maxUses: number | undefined,
    expiresAt: number | undefined
  ) => void;
}) {
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const parseNumber = (str: string) => {
    const value = parseInt(str);
    if (!value) return undefined;
    return value;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedMaxUses = parseNumber(maxUses);
    const parsedExpiresAt = parseNumber(expiresAt);
    if (onSubmit) {
      onSubmit(
        parsedMaxUses,
        parsedExpiresAt ? Date.now() + parsedExpiresAt * 1000 : undefined // convert seconds to milliseconds
        // this gives us absolute timestamp
      );
    }
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Invite</DialogTitle>
      </DialogHeader>
      <form className="contents" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="expiresAt">Expires At</Label>
          <Select value={expiresAt} onValueChange={setExpiresAt}>
            <SelectTrigger>
              <SelectValue placeholder="Select expiration time" />
            </SelectTrigger>
            <SelectContent>
              {EXPIRES_AT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="maxUses">Max Uses</Label>
          <Select value={maxUses} onValueChange={setMaxUses}>
            <SelectTrigger>
              <SelectValue placeholder="Select max uses" />
            </SelectTrigger>
            <SelectContent>
              {MAX_USES_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button>Create Invite</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// This is the dialog content for when a user has the link and wants to share it
function CreatedInvite({
  inviteId,
  onClose,
}: {
  inviteId: Id<"invites">;
  onClose: () => void;
}) {
  const url = new URL(`/join/${inviteId}`, window.location.href).toString();
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite Created</DialogTitle>
        <DialogDescription>
          You can send this link to your friends to invite them to the server.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <Label>Invite Link</Label>
        <Input id="url" type="text" value={url} readOnly />
      </div>
      <DialogFooter>
        <Button variant={"secondary"} onClick={onClose}>
          Back
        </Button>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(url); // this line copies the url to the clipboard
            toast.success("Copied to clipboard");
          }}
        >
          Copy
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
