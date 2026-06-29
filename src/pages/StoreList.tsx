import { useMemo, useState } from "react";
import { RouteFilter } from "../components/RouteFilter";
import { StoreCard } from "../components/StoreCard";
import type { CompletionFilter, RouteGroup, Store } from "../types";

type StoreListProps = {
  stores: Store[];
  completed: Record<string, boolean>;
  notes: Record<string, string>;
  onNavigate: (page: string) => void;
  onToggleComplete: (storeId: string) => void;
};

export function StoreList({ stores, completed, notes, onNavigate, onToggleComplete }: StoreListProps) {
  const [selectedRoute, setSelectedRoute] = useState<RouteGroup | "all">("all");
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>("all");

  const filteredStores = useMemo(
    () =>
      stores.filter((store) => {
        const routeMatches = selectedRoute === "all" || store.routeGroup === selectedRoute;
        const isComplete = Boolean(completed[store.id]);
        const completionMatches =
          completionFilter === "all" ||
          (completionFilter === "complete" && isComplete) ||
          (completionFilter === "incomplete" && !isComplete);

        return routeMatches && completionMatches;
      }),
    [completionFilter, completed, selectedRoute, stores],
  );

  return (
    <main className="page-grid">
      <section className="section-heading">
        <h2>Store List</h2>
        <p>Filter the local sample stores by route group or walk status.</p>
      </section>

      <RouteFilter selectedRoute={selectedRoute} onChange={setSelectedRoute} />

      <div className="filter-row" aria-label="Completion filter">
        {(["all", "complete", "incomplete"] as CompletionFilter[]).map((filter) => (
          <button
            className={completionFilter === filter ? "active" : ""}
            key={filter}
            onClick={() => setCompletionFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      <section className="store-grid">
        {filteredStores.map((store) => (
          <StoreCard
            isComplete={Boolean(completed[store.id])}
            key={store.id}
            note={notes[store.id]}
            onNavigate={onNavigate}
            onToggleComplete={onToggleComplete}
            store={store}
          />
        ))}
      </section>
    </main>
  );
}
