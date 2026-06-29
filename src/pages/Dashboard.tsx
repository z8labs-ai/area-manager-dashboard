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
  const walkStores = stores.filter((store) => store.requiresMonthlyWalk);
  const completedCount = walkStores.filter((store) => completed[store.id]).length;
  const nonWalkCount = stores.length - walkStores.length;

  return (
    <main className="page-grid">
      <ProgressSummary completedCount={completedCount} totalCount={walkStores.length} monthKey={monthKey} />

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

      <section className="summary-strip">
        <article>
          <p className="eyebrow">Territory</p>
          <h3>{stores.length} total locations</h3>
        </article>
        <article>
          <p className="eyebrow">Monthly walks</p>
          <h3>{walkStores.length} required</h3>
        </article>
        <article>
          <p className="eyebrow">Reference only</p>
          <h3>{nonWalkCount} non-walk</h3>
        </article>
      </section>

      <section>
        <div className="section-heading">
          <h2>Route zones</h2>
          <p>Geographic clusters used for pin colors and travel planning.</p>
        </div>

        <div className="route-grid">
          {routeGroups.map((route) => {
            const routeStores = stores.filter((store) => store.routeGroup === route);
            const routeWalkStores = routeStores.filter((store) => store.requiresMonthlyWalk);
            const routeCompleted = routeWalkStores.filter((store) => completed[store.id]).length;

            return (
              <article className="route-card" key={route}>
                <span className="route-stripe" style={{ backgroundColor: routeColors[route as RouteGroup] }} />
                <p className="eyebrow">{route} route</p>
                <h3>
                  {routeCompleted}/{routeWalkStores.length} complete
                </h3>
                <p>
                  {routeStores.length} total locations
                  {routeStores.length !== routeWalkStores.length ? `, ${routeStores.length - routeWalkStores.length} non-walk` : ""}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
