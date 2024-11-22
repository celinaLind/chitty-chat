import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@clerk/nextjs";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { useMutation, useQuery } from "convex/react";
import { PlusIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { NewDirectMessage } from "./new-direct-message";
import { usePathname } from "next/navigation";

const useTestUsers = () => {
  const user = useQuery(api.functions.user.get); // get current user

  if (!user) {
    return [];
  }

  return [user, user, user, user];
};

export function DMSidebar() {
  const user = useQuery(api.functions.user.get);
  const directMessages = useQuery(api.functions.dm.list);
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  return (
    <Sidebar className="left-12">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/friends" || pathname === "/"}
                >
                  <Link href="/friends">
                    <User2Icon />
                    Friends
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
          <NewDirectMessage />
          <SidebarGroupContent>
            <SidebarMenu>
              {directMessages?.map((dm) => (
                <SidebarMenuItem key={dm._id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/dm/${dm._id}`}
                  >
                    <Link href={`/dm/${dm._id}`}>
                      <Avatar className="size-6">
                        <AvatarImage src={dm.otherUser.image} />
                        <AvatarFallback>
                          {dm.otherUser.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{dm.otherUser.username}</p>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  {/* asChild means the sidebarmenubutton will be the dropdown menu trigger */}
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="flex items-center">
                      <Avatar className="size-6">
                        <AvatarImage src={user!.image} />
                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{user.username}</p>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <SignOutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
