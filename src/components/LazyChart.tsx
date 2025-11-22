import { Suspense, lazy, ComponentType } from 'react';
import { SkeletonChart } from '@/components/ui/skeleton-chart';

interface LazyChartProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  [key: string]: any;
}

/**
 * Wrapper component for lazy loading charts with skeleton fallback
 * Improves initial page load performance by code-splitting chart components
 */
export const LazyChart = ({ component, ...props }: LazyChartProps) => {
  const Component = lazy(component);

  return (
    <Suspense fallback={<SkeletonChart />}>
      <Component {...props} />
    </Suspense>
  );
};
