"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VERTICALS } from "@/lib/verticals";
import type { Vertical } from "@/lib/supabase/types";

export function VerticalFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentVerticals = searchParams.get("verticals")?.split(",").filter(Boolean) ?? [];

  const toggleVertical = (vertical: Vertical) => {
    const params = new URLSearchParams(searchParams.toString());
    const verticals = params.get("verticals")?.split(",").filter(Boolean) ?? [];

    if (verticals.includes(vertical)) {
      const updated = verticals.filter((v) => v !== vertical);
      if (updated.length === 0) {
        params.delete("verticals");
      } else {
        params.set("verticals", updated.join(","));
      }
    } else {
      params.set("verticals", [...verticals, vertical].join(","));
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("verticals");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="size-4" />
          Filter by Vertical
          {currentVerticals.length > 0 && (
            <span className="bg-primary text-primary-foreground ml-1 rounded-full px-2 py-0.5 text-xs font-medium">
              {currentVerticals.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Verticals</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.values(VERTICALS).map((vertical) => (
          <DropdownMenuCheckboxItem
            key={vertical.slug}
            checked={currentVerticals.includes(vertical.slug)}
            onCheckedChange={() => toggleVertical(vertical.slug)}
          >
            {vertical.title}
          </DropdownMenuCheckboxItem>
        ))}
        {currentVerticals.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm font-normal"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
