"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, RotateCcw, Heart, Download } from "lucide-react";

type CatImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  breeds: Array<{
    id: string;
    name: string;
    description: string;
    temperament: string;
    origin: string;
  }>;
};

export default function CatGalleryPage() {
  const [images, setImages] = useState<CatImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch cat images from The Cat API
  const fetchCatImages = useCallback(async (searchQuery = "") => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        limit: "12",
        has_breeds: "true",
        order: "Desc"
      });
      
      if (searchQuery) {
        // Search by breed name
        params.append("breed_ids", searchQuery);
      }
      
      const url = `/api/cat-images?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cat images: ${response.status} ${response.statusText}`);
      }
      
      const data: CatImage[] = await response.json();
      setImages(data);
    } catch (err) {
      console.error("Error fetching cat images:", err);
      setError("Failed to load cat images. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load random cat images on initial render
  useEffect(() => {
    fetchCatImages();
  }, [fetchCatImages]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatImages(searchTerm);
  };

  // Load more random cat images
  const handleLoadMore = () => {
    fetchCatImages();
  };

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <span className="text-2xl">🐱</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Cat Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse beautiful cat pictures from The Cat API
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Cat Breeds</CardTitle>
            <CardDescription>
              Search for specific cat breeds or get random cat images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for cat breeds (e.g. Siamese, Persian)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button type="button" variant="outline" onClick={handleLoadMore}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Random
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-center">
            {error}
          </div>
        )}

        {/* Cat Images Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.breeds.length > 0 ? image.breeds[0].name : "Cat"}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      {image.breeds.length > 0 ? (
                        <>
                          <h3 className="font-semibold text-lg">{image.breeds[0].name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {image.breeds[0].description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                              {image.breeds[0].origin}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                              {image.breeds[0].temperament.split(',')[0]}
                            </span>
                          </div>
                        </>
                      ) : (
                        <h3 className="font-semibold text-lg">Cat</h3>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = image.url;
                          link.download = `cat-${image.id}.jpg`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No cat images found.</p>
                <Button onClick={handleLoadMore} className="mt-4">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Load Random Cats
                </Button>
              </div>
            )}
          </>
        )}

        {/* Load More Button */}
        {!loading && images.length > 0 && (
          <div className="mt-8 text-center">
            <Button onClick={handleLoadMore} size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Load More Cats
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}