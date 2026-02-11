import * as React from "react";
import { LucideIcon, OctagonAlert } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface AppInputProps extends React.ComponentPropsWithRef<"input"> {
  label?: string;
  errorMsg?: string;
  containerClassName?: string;
  iconStart?: LucideIcon;
  iconEnd?: LucideIcon;
}

const InputIcon = ({
  icon: Icon,
  side,
}: {
  icon: LucideIcon;
  side: "start" | "end";
}) => {
  return (
    <Icon
      size={24}
      strokeWidth={1.5}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 w-6 h-6",
        side === "start" ? "left-3.25" : "right-3.25",
      )}
    />
  );
};

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      className,
      id,
      name,
      type = "text",
      label,
      errorMsg,
      containerClassName,
      iconStart,
      iconEnd,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || name || generatedId;

    return (
      <div className={cn("relative w-full group", containerClassName)}>
        <label
          htmlFor={inputId}
          className={cn(
            "absolute -top-2 left-3 px-1 bg-background text-sm text-input capitalize group-focus-within:text-primary",
            errorMsg && " group-focus-within:text-destructive",
          )}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          data-slot="input"
          aria-invalid={!!errorMsg}
          className={cn(
            "placeholder:text-input-secondary selection:bg-primary dark:selection:text-primary-muted px-3 py-1 w-full min-w-0 h-14 bg-transparent border-2 border-input-secondary rounded text-base text-input outline-none transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 autofill:bg-transparent",
            "focus-visible:border-primary",
            errorMsg && "border-destructive focus-visible:border-destructive",
            iconStart && "pl-12",
            (iconEnd || children) && "pr-12",
            "aria-invalid:border-destructive",
            className,
          )}
          {...props}
        />
        {iconStart && <InputIcon icon={iconStart} side="start" />}
        {iconEnd ? (
          <InputIcon icon={iconEnd} side="end" />
        ) : (
          children && (
            <div className="absolute top-1/2 right-3.25 -translate-y-1/2 w-6 h-6">
              {children}
            </div>
          )
        )}
        {errorMsg && (
          <span className="absolute -bottom-1 left-4 flex items-center gap-1 text-sm text-destructive">
            <OctagonAlert className="w-3.5 h-3.5 text-destructive" />
            {errorMsg}
          </span>
        )}
      </div>
    );
  },
);

AppInput.displayName = "AppInput";
