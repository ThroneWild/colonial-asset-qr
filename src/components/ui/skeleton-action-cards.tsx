import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonActionCardsProps {
  count?: number;
}

export function SkeletonActionCards({ count = 4 }: SkeletonActionCardsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card 
          key={i} 
          className="p-6 sm:p-8 text-center shadow-card border-0 animate-pulse"
        >
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl" />
            <div className="w-full space-y-2">
              <Skeleton className="h-5 w-3/4 mx-auto" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}
