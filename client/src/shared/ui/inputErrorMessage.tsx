import { OctagonAlert } from "lucide-react";
import { cn } from "../lib/utils";

export function InputErrorMessage({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "absolute -bottom-6 left-4 flex items-center gap-1 text-sm text-destructive whitespace-nowrap",
        className,
      )}
    >
      <OctagonAlert className="w-3.5 h-3.5 text-destructive" />
      {message}
    </span>
  );
}
