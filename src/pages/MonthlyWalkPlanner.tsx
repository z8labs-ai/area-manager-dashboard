import { useMemo } from "react";
import { buildSmartWalkPlan } from "../planner";
import { routeColors } from "../routeColors";
import type { HomeBase, Store } from "../types";
import { formatStoreLabel } from "../utils";

type MonthlyWalkPlannerProps = {
  homeBase: HomeBase;
  stores: Store[];
  completed: Record<string, boolean>;
  monthKey: string;
  onToggleComplete: (storeId: string) => void;
  onNavigate: (page: string) => void;
};

export function MonthlyWalkPlanner({
  homeBase,
  stores,
  completed,
  monthKey,
  onToggleComplete,
  onNavigate,
}: MonthlyWalkPlannerProps) {
  const walkStores = stores.filter((store) => store.requiresMonthlyWalk);
  const smartPlan = useMemo(() => buildSmartWalkPlan(stores, homeBase), [homeBase, stores]);
  const plannedStores = smartPlan.reduce(
    (total, week) => total + week.days.reduce((dayTotal, day) => dayTotal + day.stores.length, 0),
    0,
  );

  return (
    <main className="page-grid">
      <section className="section-heading">
        <p className="eyebrow">{monthKey}</p>
        <h2>Smart Monthly Walk Planner</h2>
        <p>
          Monday through Thursday favors stores close to home base. Friday and Saturday are reserved for outside
          clusters, with Saturday used as the second walk when a zone needs an overnight trip.
        </p>
      </section>

      <section className="planner-overview">
        <article>
          <p className="eyebrow">Planning rule</p>
          <h3>3-4 stores per walk</h3>
        </article>
        <article>
          <p className="eyebrow">Planned</p>
          <h3>
            {plannedStores}/{walkStores.length} stores
          </h3>
        </article>
        <article>
          <p className="eyebrow">Home base</p>
          <h3>Glenarden, MD</h3>
        </article>
      </section>

      <div className="smart-planner">
        {smartPlan.map((week) => (
          <section className="planner-week" key={week.weekNumber}>
            <div className="planner-week-heading">
              <p className="eyebrow">Week {week.weekNumber}</p>
              <h3>{week.days.length} suggested walk days</h3>
            </div>

            <div className="planner-day-grid">
              {week.days.map((day) => {
                const completeCount = day.stores.filter((store) => completed[store.id]).length;
                const color = day.routeGroup ? routeColors[day.routeGroup] : routeColors["Local MD/DC"];

                return (
                  <article className="planner-day" key={day.id}>
                    <span className="route-stripe" style={{ backgroundColor: color }} />
                    <div className="planner-day-header">
                      <div>
                        <p className="eyebrow">{day.dayName}</p>
                        <h4>{day.title}</h4>
                      </div>
                      <span className="status complete">
                        {completeCount}/{day.stores.length}
                      </span>
                    </div>

                    <p>{day.guidance}</p>

                    <div className="detail-facts">
                      <span>{day.dayType === "local" ? "Stay local" : "Travel cluster"}</span>
                      <span>{day.estimatedMiles} estimated miles</span>
                    </div>

                    {day.stores.map((store, index) => (
                      <article className="planner-row compact" key={store.id}>
                        <label>
                          <input
                            checked={Boolean(completed[store.id])}
                            onChange={() => onToggleComplete(store.id)}
                            type="checkbox"
                          />
                          <span>
                            <strong>
                              {index + 1}. {store.name}
                            </strong>
                            <small>{formatStoreLabel(store)}</small>
                          </span>
                        </label>

                        <button type="button" className="secondary" onClick={() => onNavigate(`store/${store.id}`)}>
                          Details
                        </button>
                      </article>
                    ))}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
