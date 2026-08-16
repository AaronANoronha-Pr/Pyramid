"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function parseDueDate(value?: string): Date | null {
  if (!value || value === "No date") return null;
  const parsed = new Date(`${value} ${new Date().getFullYear()}`);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarPicker({
  value,
  onSelectDate,
  minDate,
  maxDate,
}: {
  value?: string;
  onSelectDate: (formattedDate: string) => void;
  // Optional bounds, in the same "D MMM" format as `value` — days outside this
  // range are shown disabled instead of being selectable.
  minDate?: string;
  maxDate?: string;
}) {
  const parsedValue = parseDueDate(value);
  const parsedMin = parseDueDate(minDate);
  const parsedMax = parseDueDate(maxDate);
  const [currentDate, setCurrentDate] = useState(() => parsedValue ?? new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
  const today = new Date();

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayOffset = i - firstDayOfWeek + 1;
    const date = new Date(year, month, dayOffset);
    return { date, inMonth: dayOffset >= 1 && dayOffset <= daysInMonth };
  });

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function handleSelect(date: Date) {
    const m = date.toLocaleDateString("en-US", { month: "short" });
    onSelectDate(`${date.getDate()} ${m}`);
  }

  return (
    <div className="w-[178px] select-none text-center">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex items-center justify-center text-foreground hover:text-muted-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium text-foreground">
          {monthName} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex items-center justify-center text-foreground hover:text-muted-foreground"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] text-muted-foreground">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center text-xs">
        {cells.map(({ date, inMonth }, i) => {
          const isSelected = !!parsedValue && sameDay(date, parsedValue);
          const isToday = !isSelected && sameDay(date, today);
          const isDisabled =
            (!!parsedMin && date < parsedMin && !sameDay(date, parsedMin)) ||
            (!!parsedMax && date > parsedMax && !sameDay(date, parsedMax));

          return (
            <div key={i} className="flex justify-center py-[3px]">
              {inMonth && !isDisabled ? (
                <button
                  type="button"
                  onClick={() => handleSelect(date)}
                  className={`flex h-6 w-6 items-center justify-center rounded-full font-medium transition-colors ${
                    isSelected
                      ? "bg-foreground text-background"
                      : isToday
                        ? "bg-muted text-foreground"
                        : "text-foreground hover:bg-accent"
                  }`}
                >
                  {date.getDate()}
                </button>
              ) : inMonth ? (
                <span
                  className="flex h-6 w-6 cursor-not-allowed items-center justify-center text-muted-foreground/40"
                  title="Out of range"
                >
                  {date.getDate()}
                </span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center text-muted-foreground/50">
                  {date.getDate()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
