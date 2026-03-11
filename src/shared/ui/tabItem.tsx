import { AppButton } from "./appButton";
import { cn } from "@shared/lib/utils";

interface TabItemProps {
  label: string;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
  activeClassName?: string;
}

export function TabItem({
  label,
  isActive,
  className,
  activeClassName,
}: TabItemProps) {
  return (
    <AppButton
      intent="ghost"
      className={cn(`relative w-full md:hover:scale-100`, className)}
    >
      {label}
      {isActive && (
        <span
          className={cn(
            "absolute -bottom-5 left-0 h-1 w-full bg-primary",
            activeClassName,
          )}
        />
      )}
    </AppButton>
  );
}
