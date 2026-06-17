"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@shared/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      classNames={{
        root: "w-full",
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-3 min-w-[240px]",
        month_caption: "relative flex items-center justify-center h-9",
        caption_label: "text-sm font-semibold pointer-events-none",
        nav: "contents",
        button_previous: "absolute left-4 top-[16px] z-10 h-7 w-7 flex items-center justify-center rounded-md border border-[#D7E2EE] text-foreground-muted hover:border-primary hover:text-primary transition-colors cursor-pointer",
        button_next: "absolute right-4 top-[16px] z-10 h-7 w-7 flex items-center justify-center rounded-md border border-[#D7E2EE] text-foreground-muted hover:border-primary hover:text-primary transition-colors cursor-pointer",
        month_grid: "w-full border-collapse",
        weekdays: "flex mb-1",
        weekday: "flex-1 text-center text-[11px] font-medium text-foreground-muted py-1",
        weeks: "flex flex-col gap-0.5",
        week: "flex",
        day: "flex-1 text-center p-0",
        day_button: [
          "mx-auto h-8 w-8 flex items-center justify-center rounded-lg text-sm transition-colors",
          "hover:bg-primary/10 hover:text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/30",
        ].join(" "),
        selected: "[&>button]:bg-primary [&>button]:text-foreground-static [&>button]:font-semibold [&>button]:hover:bg-primary/90 [&>button]:!border-transparent [&>button]:!text-foreground-static",
        today: "[&>button]:border [&>button]:border-primary [&>button]:text-primary [&>button]:font-semibold",
        outside: "[&>button]:text-foreground-muted [&>button]:opacity-35",
        disabled: "[&>button]:opacity-25 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left"
            ? <ChevronLeft className="h-3.5 w-3.5" />
            : <ChevronRight className="h-3.5 w-3.5" />,
      }}
      {...props}
    />
  );
}
