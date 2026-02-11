import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const appButtonVariants = cva(
  "inline-flex justify-center items-center gap-1 lg:gap-2 font-medium text-sm text-foreground cursor-pointer transition-all active:scale-95 cursor-pointer disabled:opacity-50",
  {
    variants: {
      intent: {
        primary:
          "py-3 px-3 md:py-2.5 lg:px-4 bg-primary rounded md:hover:bg-accent",
        ghost:
          "py-2 h-auto bg-transparent font-semibold hover:bg-transparent md:hover:text-primary",
        outline:
          "py-3.5 bg-transparent border border-primary rounded hover:bg-accent",
        empty: "p-0 bg-transparent"
        },
    },
    defaultVariants: {
      intent: "primary",
    },
  },
);

interface AppButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof appButtonVariants> {
  icon?: LucideIcon;
  iconSize?: number;
  iconClasses?: string;
}

export const AppButton = ({
  className,
  intent,
  icon: Icon,
  iconSize,
  iconClasses,
  children,
  ...props
}: AppButtonProps) => {
  return (
    <button className={cn(appButtonVariants({ intent, className }))} {...props}>
      {Icon && (
        <Icon
          size={iconSize || 24}
          strokeWidth={1.5}
          className={cn("w-5.5 h-5.5 md:w-6 md:h-6 shrink-0", iconClasses)}
        />
      )}
      {children}
    </button>
  );
};
