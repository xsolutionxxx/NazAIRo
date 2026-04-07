import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronDown,
  User,
  History,
  CreditCard,
  LifeBuoy,
  LogOut,
  ChevronRight,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { AppButton } from "@/shared/ui/appButton";
import { UserAvatar } from "@/shared/ui/userAvatar";

import { cn } from "@/shared/lib/utils";

import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks/redux";
import { logout } from "@/features/auth/model/authActions";

interface UserMenuProps {
  className?: string;
}

export default function UserMenu({ className }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.authReducer);

  const handleLogout = async () => {
    const resultAction = await dispatch(logout());

    if (logout.fulfilled.match(resultAction)) {
      redirect("/");
    }
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild onMouseEnter={() => setIsOpen(true)}>
          <div
            className={cn(
              "relative hidden md:flex items-center gap-3",
              className,
            )}
          >
            <div className="relative">
              <UserAvatar
                src="/profile-placeholder.png"
                className="w-10 h-10"
              />
              <div className="absolute bottom-px -right-px p-px rounded-full bg-accent">
                <ChevronDown strokeWidth={1.5} size={12} color="#112211" />
              </div>
            </div>
            <span className="font-semibold">
              {user?.firstName} {user?.lastName?.[0]}.
            </span>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="p-7 min-w-80 flex flex-col gap-4 bg-surface border-none rounded-xl font-medium"
          align="end"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="flex items-center gap-4">
            <UserAvatar src="/profile-placeholder.png" className="w-13 h-13" />
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-xs text-foreground-muted">
                {user?.email}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-foreground opacity-25" />

          <div className="flex flex-col gap-2">
            <DropdownMenuItem className="focus:bg-transparent hover:bg-transparent cursor-pointer">
              <Link
                href="/account"
                className="w-full flex justify-between items-center md:hover:text-primary md:hover:scale-103 active:scale-95 transition-all"
              >
                <div className="flex items-center">
                  <User strokeWidth={2.5} size={18} className="mr-2" />
                  My Account
                </div>
                <ChevronRight strokeWidth={2.5} size={16} />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-transparent hover:bg-transparent cursor-pointer">
              <Link
                href="/account/history"
                className="w-full flex justify-between items-center md:hover:text-primary md:hover:scale-103 active:scale-95 transition-all"
              >
                <div className="flex items-center">
                  <History strokeWidth={2.5} size={18} className="mr-2" />
                  History
                </div>
                <ChevronRight strokeWidth={2.5} size={16} />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-transparent hover:bg-transparent cursor-pointer">
              <Link
                href="/account/payments"
                className="w-full flex justify-between items-center md:hover:text-primary md:hover:scale-103 active:scale-95 transition-all"
              >
                <div className="flex items-center">
                  <CreditCard strokeWidth={2.5} size={18} className="mr-2" />
                  Payments
                </div>
                <ChevronRight strokeWidth={2.5} size={16} />
              </Link>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator className="bg-foreground opacity-25" />

          <div className="flex flex-col gap-2">
            <DropdownMenuItem className="focus:bg-transparent hover:bg-transparent cursor-pointer">
              <Link
                href="/support"
                className="w-full flex justify-between items-center md:hover:text-primary md:hover:scale-103 active:scale-95 transition-all"
              >
                <div className="flex items-center">
                  <LifeBuoy strokeWidth={2.5} size={18} className="mr-2" />
                  Support
                </div>
                <ChevronRight strokeWidth={2.5} size={16} />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-transparent hover:bg-transparent cursor-pointer">
              <AppButton
                intent="ghost"
                className="font-medium md:hover:text-accent"
                onClick={() => handleLogout()}
              >
                <LogOut strokeWidth={2.5} size={18} />
                Logout
              </AppButton>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
