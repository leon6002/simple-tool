import { Card, CardContent } from "@/components/ui/card";
import { GitBranch } from "lucide-react";

export const EmptyCard = () => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm md:col-span-2">
      <CardContent className="py-12 text-center">
        <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No commands found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </CardContent>
    </Card>
  );
};
