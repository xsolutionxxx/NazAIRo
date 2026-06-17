"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover";
import { cn } from "@shared/lib/utils";

interface DatePickerProps {
  value?: string;           // yyyy-MM-dd
  onChange: (val: string) => void;
  placeholder?: string;
  min?: string;             // yyyy-MM-dd
  className?: string;
  triggerClassName?: string;
  label?: string;
  errorMsg?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  min,
  className,
  triggerClassName,
  label,
  errorMsg,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Fully controlled: display is derived from the `value` prop.
  // Parent owns the source of truth — no local date state to get out of sync.
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const d = parse(value, "yyyy-MM-dd", new Date());
    return isValid(d) ? d : undefined;
  }, [value]);

  const minDate = React.useMemo(() => {
    if (!min) return undefined;
    const d = parse(min, "yyyy-MM-dd", new Date());
    return isValid(d) ? d : undefined;
  }, [min]);

  // Stable reference — prevents react-day-picker v10 from re-evaluating
  // disabled on every parent re-render and potentially clearing the selection.
  const isDisabled = React.useCallback(
    (day: Date) => !!(minDate && day < minDate),
    [minDate],
  );

  const displayValue = selectedDate ? format(selectedDate, "d MMM yyyy") : "";

  const handleSelect = React.useCallback((day: Date | undefined) => {
    if (!day) return;
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  }, [onChange]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className={cn(
          "text-xs font-medium",
          errorMsg ? "text-destructive" : "text-foreground-muted",
        )}>
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "relative w-full h-14 px-4 pr-10 border-2 bg-transparent outline-none transition-colors text-left text-sm rounded-xl",
              errorMsg
                ? "border-destructive hover:border-destructive"
                : "border-input-secondary hover:border-primary",
              open && !errorMsg && "border-primary",
              triggerClassName,
            )}
          >
            <span className={cn(!displayValue && "text-foreground-muted/50")}>
              {displayValue || placeholder}
            </span>
            <CalendarDays
              size={16}
              strokeWidth={1.5}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-surface border border-[#D7E2EE] shadow-xl rounded-2xl"
          align="start"
          sideOffset={6}
          style={{ zIndex: 999999 }}
        >
          <Calendar
            mode="single"
            required
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={minDate ? isDisabled : undefined}
            defaultMonth={selectedDate ?? minDate}
          />
        </PopoverContent>
      </Popover>
      {errorMsg && (
        <p className="text-xs text-destructive leading-tight">{errorMsg}</p>
      )}
    </div>
  );
}
