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
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function NewDirectMessage() {
  const [open, setOpen] = useState(false);
  const createDirectMessage = useMutation(api.functions.dm.create);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // get the id of the new direct message
      const id = await createDirectMessage({
        username: e.currentTarget.username.value,
      });
      setOpen(false);
      //   make the router.push redirect faster
      router.push(`/dm/${id}`);
      //   redirect to the new direct message
    } catch (error) {
      toast.error("Failed to create direct message.", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction>
          <PlusIcon />
          <span className="sr-only">New Direct Message</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Direct Message</DialogTitle>
          <DialogDescription>
            Enter a username to start a new direct message.
          </DialogDescription>
        </DialogHeader>
        {/* Create a form without styling by adding contents className */}
        <form className="contents" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" />
          </div>
          <DialogFooter>
            <Button>Send New Message</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
