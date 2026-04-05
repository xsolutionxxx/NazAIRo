import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";

import { AppButton } from "@/shared/ui/appButton";
import { UserAvatar } from "@/shared/ui/userAvatar";

import { cn } from "@/shared/lib/utils";

import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks/redux";
import { logout } from "@/features/auth/model/authActions";

interface UserMenuProps {
  className?: string;
}

export default function UserMenu({ className }: UserMenuProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.authReducer);

  const handleLogout = async () => {
    const resultAction = await dispatch(logout());

    if (logout.fulfilled.match(resultAction)) {
      redirect("/");
    }
  };

  return (
    <div className="relative hidden md:block">
      <Link
        href="/account"
        className={cn("flex items-center gap-3", className)}
      >
        <div className="relative">
          <UserAvatar src="/avatar.jpg" className="w-10 h-10" />
          <div className="absolute bottom-px -right-px p-px rounded-full bg-accent">
            <ChevronDown strokeWidth={1.5} size={12} color="#112211" />
          </div>
        </div>
        <span className="font-semibold">
          {user?.firstName} {user?.lastName?.[0]}.
        </span>
      </Link>
      <div className="absolute top-14 right-0 p-8 w-80 bg-surface rounded-xl z-10000">
        <AppButton
          intent="ghost"
          icon={LogOut}
          className="font-medium md:hover:text-accent"
          iconClasses="w-4.5 h-4.5"
          onClick={handleLogout}
        >
          Logout
        </AppButton>
      </div>
    </div>
  );
}
