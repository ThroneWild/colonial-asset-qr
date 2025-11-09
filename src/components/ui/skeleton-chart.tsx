import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonChart = () => {
  return (
    <Card className="glass-light">
      <CardHeader>
        <Skeleton className="h-6 w-48 bg-muted/50" />
        <Skeleton className="h-4 w-64 bg-muted/50 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-64 w-full bg-muted/50" />
        </div>
      </CardContent>
    </Card>
  );
};