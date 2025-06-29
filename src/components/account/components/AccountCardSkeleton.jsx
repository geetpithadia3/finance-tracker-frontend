import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const AccountCardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-6 bg-secondary/60 rounded animate-pulse w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-secondary/60 rounded animate-pulse w-1/3" />
      </CardContent>
    </Card>
  );
}; 