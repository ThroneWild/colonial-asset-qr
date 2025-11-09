import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonStats = () => {
  return (
    <Card className="p-6 glass-light">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 bg-muted/50" />
          <Skeleton className="h-8 w-8 rounded-full bg-muted/50" />
        </div>
        <Skeleton className="h-10 w-40 bg-muted/50" />
        <Skeleton className="h-4 w-24 bg-muted/50" />
      </div>
    </Card>
  );
};

export const SkeletonStatsGrid = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStats key={i} />
      ))}
    </div>
  );
};