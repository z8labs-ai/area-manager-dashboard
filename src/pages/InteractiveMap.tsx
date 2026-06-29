import { useMemo, useState } from "react";
import { RouteFilter } from "../components/RouteFilter";
import { StoreMap } from "../components/StoreMap";
import type { HomeBase, RouteGroup, Store } from "../types";

type InteractiveMapProps = {
  homeBase: HomeBase;
  stores: Store[];
  completed: Record<string, boolean>;
  onNavigate: (page: string) => void;
};

export function InteractiveMap({ homeBase, stores, completed, onNavigate }: InteractiveMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<RouteGroup | "all">("all");

  const filteredStores = useMemo(
    () => stores.filter((store) => selectedRoute === "all" || store.routeGroup === selectedRoute),
    [selectedRoute, stores],
  );

  return (
    <main className="page-grid">
      <section className="section-heading">
        <h2>Interactive Map</h2>
        <p>Click a pin to see store details, route group, completion status, and directions.</p>
      </section>

      <RouteFilter selectedRoute={selectedRoute} onChange={setSelectedRoute} />

      <StoreMap homeBase={homeBase} stores={filteredStores} completed={completed} onNavigate={onNavigate} />
    </main>
  );
}
