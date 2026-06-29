import { routeColors, routeGroups } from "../routeColors";
import type { RouteGroup, Store } from "../types";
import { ProgressSummary } from "../components/ProgressSummary";

type DashboardProps = {
  stores: Store[];
  completed: Record<string, boolean>;
  monthKey: string;
  onNavigate: (page: string) => void;
};

export function Dashboard({ stores, completed, monthKey, onNavigate }: DashboardProps) {
  const completedCount = stores.filter((store) => completed[store.id]).length;

  return (
    <main className="page-grid">
      <ProgressSummary completedCount={completedCount} totalCount={stores.length} monthKey={monthKey} />

      <section className="quick-actions">
        <button type="button" onClick={() => onNavigate("map")}>
          Open map
        </button>
        <button type="button" onClick={() => onNavigate("planner")}>
          Plan this month
        </button>
        <button type="button" onClick={() => onNavigate("stores")}>
          View store list
        </button>
      </section>

      <section>
        <div className="section-heading">
          <h2>Route groups</h2>
          <p>Manual route clusters from local JSON data.</p>
        </div>

        <div className="route-grid">
          {routeGroups.map((route) => {
            const routeStores = stores.filter((store) => store.routeGroup === route);
            const routeCompleted = routeStores.filter((store) => completed[store.id]).length;

            return (
              <article className="route-card" key={route}>
                <span className="route-stripe" style={{ backgroundColor: routeColors[route as RouteGroup] }} />
                <p className="eyebrow">{route} route</p>
                <h3>
                  {routeCompleted}/{routeStores.length} complete
                </h3>
                <p>{routeStores.map((store) => store.city).join(", ")}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
