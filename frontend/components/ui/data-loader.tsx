import React, { ReactNode } from 'react';
import { Loader2, AlertTriangle, Info } from 'lucide-react';
import { Button } from './button';
import { motion } from 'framer-motion';

type DataLoaderProps<T> = {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  onRetry?: () => void;
  isEmpty?: (data: T) => boolean;
  children: ReactNode | ((data: T) => ReactNode);
};

export default function DataLoader<T>({
  isLoading,
  error,
  data,
  loadingComponent,
  errorComponent,
  emptyComponent,
  onRetry,
  isEmpty = (data) => !data || (Array.isArray(data) && data.length === 0),
  children,
}: DataLoaderProps<T>) {
  // Default loading component
  const defaultLoadingComponent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </motion.div>
  );

  // Default error component
  const defaultErrorComponent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full mb-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {error?.message || 'There was an error loading the data. Please try again.'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </motion.div>
  );

  // Default empty component
  const defaultEmptyComponent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full mb-4">
        <Info className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium mb-2">No data found</h3>
      <p className="text-muted-foreground max-w-md">
        There's nothing to display at the moment.
      </p>
    </motion.div>
  );

  if (isLoading) {
    return <>{loadingComponent || defaultLoadingComponent}</>;
  }

  if (error) {
    return <>{errorComponent || defaultErrorComponent}</>;
  }

  if (!data || isEmpty(data)) {
    return <>{emptyComponent || defaultEmptyComponent}</>;
  }

  return <>{typeof children === 'function' ? children(data) : children}</>;
} 