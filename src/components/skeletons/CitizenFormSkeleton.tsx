import { Skeleton } from "@heroui/react";

export function CitizenFormSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Cargando formulario del ciudadano"
    >
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/3 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-10 rounded-lg" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-10 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-40 rounded-md" />
        </div>
      </div>
    </div>
  );
}
