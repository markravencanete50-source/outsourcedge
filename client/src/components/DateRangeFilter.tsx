import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DateRange, RangePreset, makeRange, shiftRange, rangeLabel,
} from '@/lib/dateRange';

const PRESETS: { id: RangePreset; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

/**
 * Reusable Day / Week / Month calendar filter used across the reporting pages.
 * Controlled: parent owns the `DateRange` state and re-filters its data on change.
 */
export default function DateRangeFilter({
  value,
  onChange,
  className = '',
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const isAll = value.preset === 'all';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* preset segmented control */}
      <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-white/[.05] border border-slate-200 dark:border-white/[.08]">
        {PRESETS.map((p) => {
          const active = value.preset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(makeRange(p.id, value.anchor))}
              className={`px-3 h-8 rounded-md text-[13px] font-medium transition ${
                active
                  ? 'bg-[#1B3A4B] text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* prev / calendar / next */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          disabled={isAll}
          onClick={() => onChange(shiftRange(value, -1))}
          title="Previous"
          className="w-8 h-8 grid place-items-center rounded-md border border-slate-200 dark:border-white/[.08] text-slate-500 dark:text-slate-400 enabled:hover:bg-slate-100 dark:enabled:hover:bg-white/[.06] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-8 px-3 inline-flex items-center gap-2 rounded-md border border-slate-200 dark:border-white/[.08] text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[.06] transition min-w-[150px] justify-center"
            >
              <CalendarDays className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              {rangeLabel(value)}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={value.anchor}
              onSelect={(d) => {
                if (!d) return;
                // Picking a date keeps the active preset; if "All" was active,
                // narrow to a single day so the choice is meaningful.
                onChange(makeRange(value.preset === 'all' ? 'day' : value.preset, d));
                setOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <button
          type="button"
          disabled={isAll}
          onClick={() => onChange(shiftRange(value, 1))}
          title="Next"
          className="w-8 h-8 grid place-items-center rounded-md border border-slate-200 dark:border-white/[.08] text-slate-500 dark:text-slate-400 enabled:hover:bg-slate-100 dark:enabled:hover:bg-white/[.06] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
