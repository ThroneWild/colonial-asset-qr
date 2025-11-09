import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonCard = () => {
  return (
    <Card className="p-6 glass-light animate-fade-in">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-32 bg-muted/50" />
          <Skeleton className="h-5 w-16 bg-muted/50" />
        </div>
        
        <Skeleton className="h-8 w-3/4 bg-muted/50" />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-muted/50" />
            <Skeleton className="h-6 w-28 bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-muted/50" />
            <Skeleton className="h-6 w-28 bg-muted/50" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-muted/50" />
          <Skeleton className="h-6 w-40 bg-muted/50" />
        </div>
        
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-24 bg-muted/50" />
          <Skeleton className="h-9 w-20 bg-muted/50" />
        </div>
      </div>
    </Card>
  );
};

export const SkeletonCardGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};