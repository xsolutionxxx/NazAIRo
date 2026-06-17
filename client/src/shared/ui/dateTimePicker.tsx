"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover";
import { cn } from "@shared/lib/utils";

interface DateTimePickerProps {
  value?: string;           // "YYYY-MM-DDTHH:MM"
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  min?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  label,
  error,
  min,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Initialise once from prop — no useEffect sync to avoid cross-instance interference
  const [localDate, setLocalDate] = React.useState<Date | undefined>(() => {
    const d = value?.split("T")[0];
    if (!d) return undefined;
    const parsed = parse(d, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed : undefined;
  });
  const [localTime, setLocalTime] = React.useState<string>(
    () => value?.split("T")[1] ?? "00:00",
  );

  const minDate = React.useMemo(() => {
    if (!min) return undefined;
    const d = parse(min.split("T")[0], "yyyy-MM-dd", new Date());
    return isValid(d) ? d : undefined;
  }, [min]);

  const displayValue = localDate
    ? `${format(localDate, "d MMM yyyy")} ${localTime}`
    : "";

  const emit = (date: Date, time: string) => {
    onChange(`${format(date, "yyyy-MM-dd")}T${time}`);
  };

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    setLocalDate(day);
    emit(day, localTime);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    setLocalTime(t);
    if (localDate) emit(localDate, t);
  };

  return (
    <div className="flex flex-col gap-1.5">
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
        >
          <Calendar
            mode="single"
            selected={localDate}
            onSelect={handleDaySelect}
            disabled={minDate ? (day: Date) => day < minDate! : undefined}
            defaultMonth={localDate ?? minDate}
          />
          <div className="border-t border-[#D7E2EE] px-4 py-3 flex items-center gap-3">
            <span className="text-xs font-medium text-foreground-muted shrink-0">Time</span>
            <input
              type="time"
              value={localTime}
              onChange={handleTimeChange}
              className="flex-1 h-9 px-3 border-2 border-input-secondary rounded-lg text-sm bg-transparent outline-none hover:border-primary focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 text-xs font-medium text-primary hover:underline"
            >
              Done
            </button>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive leading-tight">{error}</p>}
    </div>
  );
}
