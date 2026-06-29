import type { RouteGroup, Store } from "./types";

type Point = {
  lat: number;
  lng: number;
};

export type ZoneBoundary = {
  routeGroup: RouteGroup;
  positions: Array<[number, number]>;
  storeCount: number;
};

function uniquePoints(stores: Store[]) {
  const pointMap = new Map<string, Point>();

  stores.forEach((store) => {
    const key = `${store.lat.toFixed(4)},${store.lng.toFixed(4)}`;
    pointMap.set(key, { lat: store.lat, lng: store.lng });
  });

  return [...pointMap.values()];
}

function cross(origin: Point, first: Point, second: Point) {
  return (first.lng - origin.lng) * (second.lat - origin.lat) - (first.lat - origin.lat) * (second.lng - origin.lng);
}

function convexHull(points: Point[]) {
  const sorted = [...points].sort((first, second) => first.lng - second.lng || first.lat - second.lat);
  const lower: Point[] = [];
  const upper: Point[] = [];

  sorted.forEach((point) => {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  });

  [...sorted].reverse().forEach((point) => {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  });

  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function paddedBox(points: Point[]) {
  const padding = 0.08;
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats) - padding;
  const maxLat = Math.max(...lats) + padding;
  const minLng = Math.min(...lngs) - padding;
  const maxLng = Math.max(...lngs) + padding;

  return [
    { lat: minLat, lng: minLng },
    { lat: minLat, lng: maxLng },
    { lat: maxLat, lng: maxLng },
    { lat: maxLat, lng: minLng },
  ];
}

function expandHull(points: Point[]) {
  const centroid = points.reduce(
    (total, point) => ({
      lat: total.lat + point.lat / points.length,
      lng: total.lng + point.lng / points.length,
    }),
    { lat: 0, lng: 0 },
  );

  return points.map((point) => ({
    lat: centroid.lat + (point.lat - centroid.lat) * 1.15,
    lng: centroid.lng + (point.lng - centroid.lng) * 1.15,
  }));
}

export function buildZoneBoundaries(stores: Store[]): ZoneBoundary[] {
  const monthlyStores = stores.filter((store) => store.requiresMonthlyWalk && store.routeGroup !== "Non-Walk");
  const storesByRoute = monthlyStores.reduce<Record<string, Store[]>>((groups, store) => {
    groups[store.routeGroup] = [...(groups[store.routeGroup] || []), store];
    return groups;
  }, {});

  return Object.entries(storesByRoute).map(([routeGroup, routeStores]) => {
    const points = uniquePoints(routeStores);
    const boundaryPoints = points.length < 3 ? paddedBox(points) : expandHull(convexHull(points));

    return {
      routeGroup: routeGroup as RouteGroup,
      positions: boundaryPoints.map((point) => [point.lat, point.lng]),
      storeCount: routeStores.length,
    };
  });
}
