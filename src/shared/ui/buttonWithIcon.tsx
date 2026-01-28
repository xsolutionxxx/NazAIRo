import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface ButtonWithIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: number;
  iconClasses?: string;
  strokeWidth?: number;
  children?: ReactNode;
}

export const ButtonWithIcon = ({
  icon: IconComponent,
  size = 24,
  iconClasses,
  strokeWidth = 1.5,
  children,
  className,
  ...props
}: ButtonWithIconProps) => {
  return (
    <button
      className={cn(
        "flex items-center gap-3 md:gap-2 font-semibold text-lg md:text-xs lg:text-sm text-foreground cursor-pointer lg:hover:text-accent",
        className,
      )}
      {...props}
    >
      <IconComponent
        size={size}
        strokeWidth={strokeWidth}
        className={iconClasses}
      />
      {children}
    </button>
  );
};
