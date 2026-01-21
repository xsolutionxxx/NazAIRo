import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface ButtonWithIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
}

export const ButtonWithIcon = ({
  icon: IconComponent,
  size = 24,
  strokeWidth = 1.5,
  children,
  className,
  ...props
}: ButtonWithIconProps) => {
  return (
    <button
      className={cn(
        "flex items-center gap-2 font-semibold text-lg md:text-xs lg:text-sm text-blackish-green lg:cursor-pointer lg:hover:text-salmon",
        className,
      )}
      {...props}
    >
      <IconComponent size={size} strokeWidth={strokeWidth} />
      {children}
    </button>
  );
};
