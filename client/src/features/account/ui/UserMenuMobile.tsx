import Link from "next/link";
import { redirect } from "next/navigation";
import {
  User,
  History,
  CreditCard,
  LifeBuoy,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { UserAvatar } from "@shared/ui/userAvatar";

import { AppButton } from "@shared/ui/appButton";

import { useAppDispatch, useAppSelector } from "@shared/lib/hooks/redux";
import { logout } from "@/features/auth/model/authActions";
import { cn } from "@/shared/lib/utils";

interface UserMenuMobileProps {
  className?: string;
}
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@shared/ui/accordion";
import { Separator } from "@shared/ui/separator";

const accountMenu = [
  {
    title: "My Account",
    href: "/account",
    icon: User,
  },
  {
    title: "History",
    href: "/account/history",
    icon: History,
  },
  {
    title: "Payments",
    href: "/account/payments",
    icon: CreditCard,
  },
];

export default function UserMenuMobile({ className }: UserMenuMobileProps) {
  const { user } = useAppSelector((state) => state.authReducer);
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    const resultAction = await dispatch(logout());

    if (logout.fulfilled.match(resultAction)) {
      redirect("/");
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="account-menu"
      className={cn("py-2 px-7 bg-surface items-center", className)}
    >
      <AccordionItem value="account-menu">
        <AccordionTrigger className="w-full flex items-center hover:no-underline cursor-pointer [&>svg]:h-6 [&>svg]:w-6 [&>svg]:stroke-[2px]">
          <Link href="/account" className="min-w-0 flex items-center gap-4">
            <UserAvatar src="/profile-placeholder.png" className="w-10 h-10" />
            <div className="flex flex-col gap-1 min-w-0">
              <p className="font-semibold truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-xs text-foreground-muted truncate">
                {user?.email}
              </span>
            </div>
          </Link>
        </AccordionTrigger>
        <AccordionContent className="pb-8">
          <Separator className="mb-4 bg-foreground opacity-25" />

          {accountMenu.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={index}
                href={item.href || "/"}
                className="mb-4 w-full flex justify-between items-center font-medium active:scale-95 transition-transform"
              >
                <div className="flex items-center">
                  <Icon strokeWidth={2.5} size={18} className="mr-2" />
                  {item.title}
                </div>
                <ChevronRight strokeWidth={2.5} size={16} />
              </Link>
            );
          })}

          <Separator className="mb-4 bg-foreground opacity-25" />

          <Link
            href="/support"
            className="mb-4 w-full flex justify-between items-center font-medium active:scale-95 transition-transform"
          >
            <div className="flex items-center">
              <LifeBuoy strokeWidth={2.5} size={18} className="mr-2" />
              Support
            </div>
            <ChevronRight strokeWidth={2.5} size={16} />
          </Link>

          <AppButton
            intent="ghost"
            className="py-0 font-medium md:hover:text-accent"
            onClick={() => handleLogout()}
          >
            <LogOut strokeWidth={2.5} size={18} />
            Logout
          </AppButton>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
