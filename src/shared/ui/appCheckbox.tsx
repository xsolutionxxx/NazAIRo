import React from "react";
import { Check } from "lucide-react";

import { cn } from "../lib/utils";
import { InputErrorMessage } from "@shared/ui/inputErrorMessage";

interface AppCheckboxProps extends React.ComponentPropsWithRef<"input"> {
  label?: React.ReactNode;
  errorMsg?: string;
  containerClassName?: string;
}

export const AppCheckbox = React.forwardRef<HTMLInputElement, AppCheckboxProps>(
  (
    { id, name, label, errorMsg, containerClassName, className, ...props },
    ref,
  ) => {
    const generatedId = React.useId();
    const checkboxId = id || name || generatedId;

    return (
      <div className="relative">
        <label
          htmlFor={checkboxId}
          className={cn(
            "flex items-center gap-2.5 cursor-pointer",
            containerClassName,
          )}
        >
          <input
            ref={ref}
            id={checkboxId}
            name={name}
            type="checkbox"
            className="peer sr-only"
            aria-invalid={!!errorMsg}
            {...props}
          />
          <div
            className={cn(
              "relative h-4.5 w-4.5 border border-input-secondary rounded cursor-pointer pointer-events-none transition-all",
              "flex items-center justify-center",
              "peer-focus-visible:outline-2 peer-focus-visible:outline-offset peer-focus-visible:outline-primary ",
              "peer-checked:[&_svg]:block peer-checked:bg-primary",
              className,
            )}
          >
            <Check
              size={14}
              strokeWidth={3}
              className="hidden peer-checked:block text-foreground-static"
            />
          </div>
          {label && (
            <span className="font-medium text-sm leading-none select-none">
              {label}
            </span>
          )}
        </label>
        {errorMsg && <InputErrorMessage message={errorMsg} />}
      </div>
    );
  },
);

AppCheckbox.displayName = "AppCheckbox";
