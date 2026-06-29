import { routeColors } from "../routeColors";
import type { Store } from "../types";
import { formatStoreLabel } from "../utils";

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
        <span className={isComplete ? "status complete" : "status"}>{isComplete ? "Complete" : "Open"}</span>
      </div>

      <p>{store.address}</p>

      <div className="store-meta">
        <span style={{ color: routeColors[store.routeGroup] }}>{store.routeGroup} route</span>
        {note ? <span>Note saved</span> : <span>No note</span>}
      </div>

      <div className="button-row">
        <button type="button" onClick={() => onToggleComplete(store.id)}>
          {isComplete ? "Mark incomplete" : "Mark complete"}
        </button>
        <button type="button" className="secondary" onClick={() => onNavigate(`store/${store.id}`)}>
          Details
        </button>
      </div>
    </article>
  );
}
