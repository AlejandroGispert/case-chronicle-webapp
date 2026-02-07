import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CaseDetailSkeleton = () => (
  <div className="space-y-4">
    <Button variant="ghost" size="sm" className="gap-2 -ml-2" disabled>
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-24" />
    </Button>

    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-7 w-3/4 max-w-md" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24 mt-2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="h-px w-full my-6" />

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Skeleton className="h-6 w-48" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-full max-w-md" />
                        <Skeleton className="h-4 w-full max-w-sm" />
                      </div>
                      <div className="flex gap-2 sm:flex-col sm:items-end text-xs">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CaseDetailSkeleton;
