"use client";

import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

export type RelatedChecklistItem = {
  id: string;
  label: string;
};

export function RelatedChecklist({
  name,
  items,
  selected = [],
  emptyLabel = "No items available",
}: {
  name: string;
  items: RelatedChecklistItem[];
  selected?: string[];
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<string[]>(selected);

  useEffect(() => {
    setChosen(selected);
  }, [selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  const toggle = (id: string) => {
    setChosen((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  return (
    <div className="rounded-md border">
      <div className="flex items-center gap-2 border-b p-2">
        <Input
          placeholder="Search..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {chosen.map((id) => (
          <input key={id} type="hidden" name={name} value={id} />
        ))}
      </div>
      <div className="max-h-48 overflow-auto p-2 text-sm">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-xs">{emptyLabel}</p>
        ) : (
          <table className="w-full">
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="py-1">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={chosen.includes(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                      {item.label}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
