import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function TestSearchPage() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Test search for:", query);
    
    // Build URL with query parameter
    const params = new URLSearchParams();
    params.set("q", query);
    
    console.log("Navigating to:", `/search-results?${params.toString()}`);
    window.location.href = `/search-results?${params.toString()}`;
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <Card className="max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Test Search</h1>
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter city name (e.g., Milan)"
              className="w-full"
            />
            <Button type="submit" className="w-full">
              Search
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-600">
            <p>Current query: {query}</p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}