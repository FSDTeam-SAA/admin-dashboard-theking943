import { TableSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse" />
      <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
      <TableSkeleton rows={10} />
    </div>
  );
}
