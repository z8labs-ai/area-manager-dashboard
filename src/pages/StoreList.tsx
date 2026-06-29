import { useMemo, useState } from "react";
import { RouteFilter } from "../components/RouteFilter";
import { StoreCard } from "../components/StoreCard";
import type { CompletionFilter, RouteGroup, Store, WalkFilter } from "../types";

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
  const [walkFilter, setWalkFilter] = useState<WalkFilter>("all");

  const filteredStores = useMemo(
    () =>
      stores.filter((store) => {
        const routeMatches = selectedRoute === "all" || store.routeGroup === selectedRoute;
        const isComplete = Boolean(completed[store.id]);
        const walkMatches =
          walkFilter === "all" ||
          (walkFilter === "required" && store.requiresMonthlyWalk) ||
          (walkFilter === "not-required" && !store.requiresMonthlyWalk);
        const completionMatches =
          completionFilter === "all" ||
          (completionFilter === "complete" && isComplete) ||
          (completionFilter === "incomplete" && !isComplete && store.requiresMonthlyWalk);

        return routeMatches && walkMatches && completionMatches;
      }),
    [completionFilter, completed, selectedRoute, stores, walkFilter],
  );

  return (
    <main className="page-grid">
      <section className="section-heading">
        <h2>Store List</h2>
        <p>Filter the local sample stores by route group or walk status.</p>
      </section>

      <RouteFilter selectedRoute={selectedRoute} onChange={setSelectedRoute} />

      <div className="filter-row" aria-label="Walk requirement filter">
        {[
          { value: "all", label: "All locations" },
          { value: "required", label: "Monthly walks" },
          { value: "not-required", label: "Non-walk" },
        ].map((filter) => (
          <button
            className={walkFilter === filter.value ? "active" : ""}
            key={filter.value}
            onClick={() => setWalkFilter(filter.value as WalkFilter)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>

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
