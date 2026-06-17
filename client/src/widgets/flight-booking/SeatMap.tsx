"use client";

import { cn } from "@shared/lib/utils";

type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

interface SeatMapProps {
  totalSeats: number;
  cabinClass: CabinClass;
  bookedSeats: string[];
  selectedSeats: string[];
  passengersCount: number;
  onChange: (seats: string[]) => void;
}

const CONFIGS: Record<CabinClass, { cols: string[]; left: string[]; right: string[]; startRow: number }> = {
  FIRST:           { cols: ["A","C"],                    left: ["A"],         right: ["C"],         startRow: 1  },
  BUSINESS:        { cols: ["A","C","D","F"],            left: ["A","C"],     right: ["D","F"],     startRow: 1  },
  PREMIUM_ECONOMY: { cols: ["A","B","C","D","E","F"],    left: ["A","B","C"], right: ["D","E","F"], startRow: 10 },
  ECONOMY:         { cols: ["A","B","C","D","E","F"],    left: ["A","B","C"], right: ["D","E","F"], startRow: 10 },
};

const LABEL: Record<CabinClass, string> = {
  FIRST: "First Class", BUSINESS: "Business", PREMIUM_ECONOMY: "Premium Economy", ECONOMY: "Economy",
};

export default function SeatMap({
  totalSeats, cabinClass, bookedSeats, selectedSeats, passengersCount, onChange,
}: SeatMapProps) {
  const cfg = CONFIGS[cabinClass];
  const numRows = Math.ceil(totalSeats / cfg.cols.length);
  const rows = Array.from({ length: numRows }, (_, i) => cfg.startRow + i);
  const booked = new Set(bookedSeats);

  const toggle = (id: string) => {
    if (booked.has(id)) return;
    if (selectedSeats.includes(id)) {
      onChange(selectedSeats.filter(s => s !== id));
    } else if (selectedSeats.length < passengersCount) {
      onChange([...selectedSeats, id]);
    }
  };

  const Seat = ({ id }: { id: string }) => {
    const isBkd = booked.has(id);
    const isSel = selectedSeats.includes(id);
    const maxed = selectedSeats.length >= passengersCount;
    const disabled = isBkd || (!isSel && maxed);
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => toggle(id)}
        title={isBkd ? "Unavailable" : id}
        className={cn(
          "w-9 h-10 rounded-md text-[10px] font-semibold border transition-all",
          isSel  && "bg-primary border-primary text-foreground-static shadow-sm cursor-pointer",
          isBkd  && "bg-foreground-muted/20 border-foreground-muted/20 text-foreground-muted/40 cursor-not-allowed",
          !isSel && !isBkd && "bg-background border-input-secondary text-foreground-muted hover:border-primary cursor-pointer",
          !isBkd && !isSel && maxed && "opacity-40 cursor-not-allowed",
        )}
      >
        {isSel ? "✓" : isBkd ? "" : id}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center select-none">

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-foreground-muted mb-6">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded border border-input-secondary bg-background inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-foreground-muted/20 border border-foreground-muted/20 inline-block" />
          Unavailable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-primary border-primary inline-block" />
          Selected
        </span>
      </div>

      {/* Cabin label */}
      <p className="text-xs font-bold tracking-widest uppercase text-foreground-muted mb-4">
        {LABEL[cabinClass]}
      </p>

      {/* Column headers + rows — fixed-width block so headers align with seats */}
      <div>
        {/* Column headers */}
        <div className="flex items-center gap-1 mb-2 ml-8">
          {cfg.left.map(col => (
            <div key={col} className="w-9 flex items-center justify-center text-[10px] font-bold text-foreground-muted">{col}</div>
          ))}
          <div className="w-6" />
          {cfg.right.map(col => (
            <div key={col} className="w-9 flex items-center justify-center text-[10px] font-bold text-foreground-muted">{col}</div>
          ))}
        </div>

        {/* Rows */}
        <div className="relative">
          <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto scrollbar-none">
            {rows.map(row => (
              <div key={row} className="flex items-center gap-1">
                <div className="w-7 text-right text-[10px] text-foreground-muted/60 font-mono shrink-0">{row}</div>
                {cfg.left.map(col => <Seat key={`${row}${col}`} id={`${row}${col}`} />)}
                <div className="w-6 shrink-0" />
                {cfg.right.map(col => <Seat key={`${row}${col}`} id={`${row}${col}`} />)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-5 text-sm text-foreground-muted text-center">
        <span className="font-semibold text-foreground">{selectedSeats.length}</span>
        {" / "}{passengersCount} seat{passengersCount !== 1 ? "s" : ""} selected
        {selectedSeats.length > 0 && (
          <span className="ml-2 font-semibold text-primary">{selectedSeats.join(", ")}</span>
        )}
      </div>
    </div>
  );
}
