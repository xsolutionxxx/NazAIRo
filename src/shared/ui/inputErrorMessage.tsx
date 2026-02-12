import { OctagonAlert } from "lucide-react";

export function InputErrorMessage({ message }: { message: string }) {
  return (
    <span className="absolute -bottom-6 left-4 flex items-center gap-1 text-sm text-destructive text-nowrap">
      <OctagonAlert className="w-3.5 h-3.5 text-destructive" />
      {message}
    </span>
  );
}
