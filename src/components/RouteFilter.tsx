import { routeColors, routeGroups } from "../routeColors";
import type { RouteGroup } from "../types";

type RouteFilterProps = {
  selectedRoute: RouteGroup | "all";
  onChange: (route: RouteGroup | "all") => void;
};

export function RouteFilter({ selectedRoute, onChange }: RouteFilterProps) {
  return (
    <div className="filter-row" aria-label="Route group filter">
      <button
        className={selectedRoute === "all" ? "active" : ""}
        onClick={() => onChange("all")}
        type="button"
      >
        All routes
      </button>

      {routeGroups.map((route) => (
        <button
          className={selectedRoute === route ? "active" : ""}
          key={route}
          onClick={() => onChange(route)}
          style={{ borderColor: routeColors[route] }}
          type="button"
        >
          <span className="route-dot" style={{ backgroundColor: routeColors[route] }} />
          {route}
        </button>
      ))}
    </div>
  );
}
