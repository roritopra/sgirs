import { Skeleton } from "@heroui/react";

export default function ReportCardSkeleton() {
  return (
    <article className="flex items-center flex-col gap-8 p-5 border border-gray-200 bg-white rounded-xl w-full md:justify-between md:flex-row">
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <Skeleton className="rounded-md">
            <div className="h-6 w-44 bg-default-200 rounded-md" />
          </Skeleton>
          <Skeleton className="rounded-full">
            <div className="h-6 w-6 bg-default-200 rounded-full" />
          </Skeleton>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="rounded-md">
            <div className="h-4 w-28 bg-default-200 rounded-md" />
          </Skeleton>
          <Skeleton className="rounded-full">
            <div className="h-6 w-20 bg-default-200 rounded-full" />
          </Skeleton>
        </div>
      </div>
      <Skeleton className="rounded-md w-full md:w-40">
        <div className="h-10 w-full bg-default-200 rounded-md" />
      </Skeleton>
    </article>
  );
}
