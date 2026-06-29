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
  return (
    <main className="page-grid">
      <section className="section-heading">
        <p className="eyebrow">{monthKey}</p>
        <h2>Monthly Walk Planner</h2>
        <p>Work route by route and mark each store complete after the walk.</p>
      </section>

      <div className="planner-grid">
        {routeGroups.map((route) => {
          const routeStores = stores.filter((store) => store.routeGroup === route);

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
