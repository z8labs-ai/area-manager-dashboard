import type { HomeBase, Store } from "./types";

export function getDirectionsUrl(homeBase: HomeBase, store: Store) {
  const origin = encodeURIComponent(homeBase.address);
  const destination = encodeURIComponent(store.address);
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
}

export function formatStoreLabel(store: Store) {
  return `${store.brand} #${store.storeNumber}`;
}

export function getWalkRequirementLabel(store: Store) {
  return store.requiresMonthlyWalk ? "Monthly walk required" : "No monthly walk";
}

export function getCompletionPercent(completedCount: number, totalCount: number) {
  if (totalCount === 0) {
    return 0;
  }

  return Math.round((completedCount / totalCount) * 100);
}
