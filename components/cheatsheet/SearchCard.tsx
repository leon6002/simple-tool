import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { CommandCategory } from "@/types";

interface SearchCardProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  commandCategories: CommandCategory[];
  tempateCategories: CommandCategory[];
}

export default function SearchCard({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  commandCategories,
  tempateCategories,
}: SearchCardProps) {
  if (
    commandCategories.length > 0 &&
    !commandCategories.some((category) => category.id === "all")
  ) {
    commandCategories.unshift({
      id: "all",
      name: "All",
      type: "command",
      description: "",
    });
  }
  return (
    <Card className="mb-8 border-border/50 shadow-xl shadow-purple-500/5">
      <CardHeader>
        <CardTitle>Search Commands</CardTitle>
        <CardDescription>
          Find commands by name, description or category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search commands..."
            className="h-12 pl-11 pr-4 rounded-full border-border/50 bg-muted/50 transition-all focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        {commandCategories.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-3 block">
              Filter by Category
            </label>
            <div className="flex flex-wrap gap-3">
              {commandCategories.map((category: CommandCategory) => (
                <Badge
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "secondary"
                  }
                  className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                    selectedCategory === category.id
                      ? "bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30"
                      : "hover:border-purple-500/50 hover:bg-purple-500/5"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {tempateCategories.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-3 block">
              Filter by Template
            </label>
            <div className="flex flex-wrap gap-3">
              {tempateCategories.map((category: CommandCategory) => (
                <Badge
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "secondary"
                  }
                  className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                    selectedCategory === category.id
                      ? "bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30"
                      : "hover:border-purple-500/50 hover:bg-purple-500/5"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
