import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonStats = () => {
  return (
    <Card className="p-5 sm:p-6 text-center shadow-card border-0 animate-pulse">
      <Skeleton className="h-3 w-24 mx-auto mb-3 bg-muted" />
      <Skeleton className="h-12 w-20 mx-auto mb-2 bg-muted" />
      <Skeleton className="h-3 w-28 mx-auto bg-muted" />
    </Card>
  );
};

export const SkeletonStatsGrid = ({ count = 4 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStats key={i} />
      ))}
    </>
  );
};