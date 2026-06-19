/**
 * Skeletons.tsx
 *
 * Reusable loading skeleton components.
 * Use these while Firestore data is loading instead of showing nothing.
 *
 * Usage:
 *   import { CardSkeleton, CardGridSkeleton, HeroSkeleton, TableRowSkeleton } from "@/components/Skeletons";
 */

function Pulse({ className }: { className: string }) {
  return (
    <div
      className={`bg-slate-800/60 rounded ${className}`}
      style={{ animation: "skeleton-pulse 1.5s ease-in-out infinite" }}
    />
  );
}

// ── Single card skeleton ──────────────────────────────────────────────────────
export function CardSkeleton() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <Pulse className="h-6 w-3/4" />
      <Pulse className="h-4 w-full" />
      <Pulse className="h-4 w-5/6" />
      <Pulse className="h-4 w-2/3" />
      <div className="pt-2">
        <Pulse className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

// ── Grid of card skeletons ────────────────────────────────────────────────────
export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Blog post list skeleton ───────────────────────────────────────────────────
export function BlogListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex gap-5">
          <Pulse className="w-24 h-24 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Pulse className="h-5 w-2/3" />
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Hero section skeleton ─────────────────────────────────────────────────────
export function HeroSkeleton() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      <Pulse className="h-10 w-72 rounded-lg" />
      <Pulse className="h-5 w-96 max-w-full" />
      <Pulse className="h-5 w-80 max-w-full" />
      <div className="flex gap-3 pt-2">
        <Pulse className="h-11 w-36 rounded-lg" />
        <Pulse className="h-11 w-36 rounded-lg" />
      </div>
    </div>
  );
}

// ── Admin table row skeleton ──────────────────────────────────────────────────
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-800">
      <td className="py-3 px-4"><Pulse className="h-4 w-40" /></td>
      <td className="py-3 px-4"><Pulse className="h-4 w-24" /></td>
      <td className="py-3 px-4"><Pulse className="h-4 w-20" /></td>
      <td className="py-3 px-4"><Pulse className="h-4 w-16" /></td>
    </tr>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </>
  );
}
