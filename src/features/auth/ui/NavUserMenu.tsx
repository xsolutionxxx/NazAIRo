import Link from "next/link";

import { UserAvatar } from "@/shared/ui/userAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/dropdown-menu";

export default function NavUserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none focus:ring-2 ring-accent rounded-full">
        <UserAvatar className="w-11 h-11" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/account">My Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/history">My Bookings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
