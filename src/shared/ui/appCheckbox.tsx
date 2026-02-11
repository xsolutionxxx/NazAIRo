import React from "react";
import { Check } from "lucide-react";

import { cn } from "../lib/utils";

interface AppCheckboxProps extends React.ComponentPropsWithRef<"input"> {
  label?: React.ReactNode;
  containerClassName?: string;
}

export const AppCheckbox = React.forwardRef<HTMLInputElement, AppCheckboxProps>(
  ({ id, name, label, containerClassName, className, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || name || generatedId;

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "flex items-center gap-2.5  cursor-pointer",
          containerClassName,
        )}
      >
        <input
          id={checkboxId}
          type="checkbox"
          ref={ref}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "relative h-4.5 w-4.5 rounded border border-input-secondary transition-all cursor-pointer",
            "peer-checked:bg-primary",
            "flex items-center justify-center",
            "peer-checked:[&_svg]:block",
            className,
          )}
        >
          <Check size={14} strokeWidth={3} className="hidden" />
        </div>
        {label && (
          <span className="font-medium text-sm leading-none">{label}</span>
        )}
      </label>
    );
  },
);

AppCheckbox.displayName = "AppCheckbox";
