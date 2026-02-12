import * as React from "react";
import { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { InputErrorMessage } from "@/shared/ui/inputErrorMessage";

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
            errorMsg && "text-destructive group-focus-within:text-destructive",
          )}
        >
          {label}
        </label>
        <input
          id={inputId}
          name={name}
          type={type}
          data-slot="input"
          ref={ref}
          aria-invalid={!!errorMsg}
          className={cn(
            "py-1 px-3 w-full min-w-0 h-14 bg-transparent border-2 border-input-secondary rounded text-base text-input outline-none transition-all placeholder:text-input-secondary autofill:bg-transparent",
            "selection:bg-primary dark:selection:text-primary-muted",
            "focus-visible:border-primary",
            "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
            "aria-invalid:border-destructive",
            errorMsg && "border-destructive focus-visible:border-destructive",
            iconStart && "pl-12",
            (iconEnd || children) && "pr-12",
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
        {errorMsg && <InputErrorMessage message={errorMsg} />}
      </div>
    );
  },
);

AppInput.displayName = "AppInput";
