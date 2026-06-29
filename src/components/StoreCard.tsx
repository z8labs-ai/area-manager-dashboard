import { routeColors } from "../routeColors";
import type { Store } from "../types";
import { formatStoreLabel, getWalkRequirementLabel } from "../utils";

type StoreCardProps = {
  store: Store;
  isComplete: boolean;
  note?: string;
  onNavigate: (page: string) => void;
  onToggleComplete: (storeId: string) => void;
};

export function StoreCard({
  store,
  isComplete,
  note,
  onNavigate,
  onToggleComplete,
}: StoreCardProps) {
  return (
    <article className="store-card">
      <div className="store-card-header">
        <div>
          <p className="eyebrow">{formatStoreLabel(store)}</p>
          <h3>{store.name}</h3>
        </div>
        <span className={isComplete ? "status complete" : "status"}>
          {store.requiresMonthlyWalk ? (isComplete ? "Complete" : "Open") : "Non-walk"}
        </span>
      </div>

      <p>{store.address}</p>
      {store.phone ? <p className="store-phone">{store.phone}</p> : null}

      <div className="store-meta">
        <span style={{ color: routeColors[store.routeGroup] }}>{store.routeGroup} route</span>
        <span>{getWalkRequirementLabel(store)}</span>
        {note ? <span>Note saved</span> : <span>No note</span>}
      </div>

      <div className="button-row">
        {store.requiresMonthlyWalk ? (
          <button type="button" onClick={() => onToggleComplete(store.id)}>
            {isComplete ? "Mark incomplete" : "Mark complete"}
          </button>
        ) : null}
        <button type="button" className="secondary" onClick={() => onNavigate(`store/${store.id}`)}>
          Details
        </button>
      </div>
    </article>
  );
}
