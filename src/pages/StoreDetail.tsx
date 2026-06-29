import type { HomeBase, Store } from "../types";
import { formatStoreLabel, getDirectionsUrl, getWalkRequirementLabel } from "../utils";
import { routeColors } from "../routeColors";

type StoreDetailProps = {
  homeBase: HomeBase;
  store?: Store;
  isComplete: boolean;
  note: string;
  onBack: () => void;
  onToggleComplete: (storeId: string) => void;
  onSaveNote: (storeId: string, note: string) => void;
};

export function StoreDetail({
  homeBase,
  store,
  isComplete,
  note,
  onBack,
  onToggleComplete,
  onSaveNote,
}: StoreDetailProps) {
  if (!store) {
    return (
      <main className="page-grid">
        <section className="empty-state">
          <h2>Store not found</h2>
          <button type="button" onClick={onBack}>
            Back to stores
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="detail-layout">
      <section className="detail-panel">
        <button type="button" className="secondary back-button" onClick={onBack}>
          Back
        </button>

        <p className="eyebrow">{formatStoreLabel(store)}</p>
        <h2>{store.name}</h2>
        <p>{store.address}</p>

        <div className="detail-facts">
          <span style={{ color: routeColors[store.routeGroup] }}>{store.routeGroup} route</span>
          <span>{store.city}, {store.state}</span>
          <span>{getWalkRequirementLabel(store)}</span>
          {store.requiresMonthlyWalk ? (
            <span>{isComplete ? "Complete this month" : "Not complete this month"}</span>
          ) : null}
        </div>

        <div className="button-row">
          {store.requiresMonthlyWalk ? (
            <button type="button" onClick={() => onToggleComplete(store.id)}>
              {isComplete ? "Mark incomplete" : "Mark complete"}
            </button>
          ) : null}
          <a className="button-link" href={getDirectionsUrl(homeBase, store)} target="_blank" rel="noreferrer">
            Google Maps directions
          </a>
        </div>
      </section>

      <section className="notes-panel">
        <label htmlFor="store-note">
          <span>Store notes</span>
          <textarea
            id="store-note"
            onChange={(event) => onSaveNote(store.id, event.target.value)}
            placeholder="Add walk notes for this store."
            value={note}
          />
        </label>
      </section>
    </main>
  );
}
