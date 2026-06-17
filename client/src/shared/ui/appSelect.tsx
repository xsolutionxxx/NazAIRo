"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover";
import { cn } from "@shared/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function AppSelect({ value, onChange, options, label, placeholder = "Select…", error, className }: AppSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className={cn("text-xs font-medium", error ? "text-destructive" : "text-foreground-muted")}>
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "relative w-full h-14 px-4 pr-10 border-2 bg-transparent outline-none transition-colors text-left text-sm rounded-xl",
              error
                ? "border-destructive hover:border-destructive"
                : "border-input-secondary hover:border-primary",
              open && !error && "border-primary",
              !selected && "text-foreground-muted/50",
            )}
          >
            {selected?.label ?? placeholder}
            <ChevronDown
              size={16}
              strokeWidth={1.5}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="p-1 bg-surface border border-[#D7E2EE] shadow-xl rounded-xl z-50"
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors text-left",
                opt.value === value
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-background text-foreground",
              )}
            >
              {opt.label}
              {opt.value === value && <Check size={14} className="text-primary shrink-0" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive leading-tight">{error}</p>}
    </div>
  );
}
