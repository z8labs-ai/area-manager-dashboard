import { routeColors, routeGroups } from "../routeColors";
import type { Store } from "../types";
import { formatStoreLabel } from "../utils";

type MonthlyWalkPlannerProps = {
  stores: Store[];
  completed: Record<string, boolean>;
  monthKey: string;
  onToggleComplete: (storeId: string) => void;
  onNavigate: (page: string) => void;
};

export function MonthlyWalkPlanner({
  stores,
  completed,
  monthKey,
  onToggleComplete,
  onNavigate,
}: MonthlyWalkPlannerProps) {
  const walkStores = stores.filter((store) => store.requiresMonthlyWalk);

  return (
    <main className="page-grid">
      <section className="section-heading">
        <p className="eyebrow">{monthKey}</p>
        <h2>Monthly Walk Planner</h2>
        <p>Work route by route. Non-walk locations stay in the store list, but are hidden from this planner.</p>
      </section>

      <div className="planner-grid">
        {routeGroups.map((route) => {
          const routeStores = walkStores.filter((store) => store.routeGroup === route);

          if (routeStores.length === 0) {
            return null;
          }

          return (
            <section className="planner-route" key={route}>
              <h3 style={{ borderColor: routeColors[route] }}>{route} route</h3>

              {routeStores.map((store) => (
                <article className="planner-row" key={store.id}>
                  <label>
                    <input
                      checked={Boolean(completed[store.id])}
                      onChange={() => onToggleComplete(store.id)}
                      type="checkbox"
                    />
                    <span>
                      <strong>{store.name}</strong>
                      <small>{formatStoreLabel(store)}</small>
                    </span>
                  </label>

                  <button type="button" className="secondary" onClick={() => onNavigate(`store/${store.id}`)}>
                    Details
                  </button>
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </main>
  );
}
