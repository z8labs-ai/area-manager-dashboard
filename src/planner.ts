import type { HomeBase, RouteGroup, Store } from "./types";

type Point = {
  lat: number;
  lng: number;
};

export type WalkDayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export type SmartWalkBlock = {
  id: string;
  weekNumber: number;
  dayName: WalkDayName;
  dayType: "local" | "travel";
  title: string;
  routeGroup?: RouteGroup;
  guidance: string;
  stores: Store[];
  estimatedMiles: number;
};

export type SmartWalkWeek = {
  weekNumber: number;
  days: SmartWalkBlock[];
};

const LOCAL_WEEKDAYS: WalkDayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday"];
const STORES_PER_WALK = 4;
const LOCAL_RADIUS_MILES = 35;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function getDistanceMiles(first: Point, second: Point) {
  const earthRadiusMiles = 3958.8;
  const latDelta = toRadians(second.lat - first.lat);
  const lngDelta = toRadians(second.lng - first.lng);
  const firstLat = toRadians(first.lat);
  const secondLat = toRadians(second.lat);

  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(firstLat) * Math.cos(secondLat) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);

  return 2 * earthRadiusMiles * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function sortNearestNeighbor(stores: Store[], start: Point) {
  const remaining = [...stores];
  const sorted: Store[] = [];
  let current = start;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = getDistanceMiles(current, remaining[0]);

    remaining.forEach((store, index) => {
      const distance = getDistanceMiles(current, store);
      if (distance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    });

    const [nearest] = remaining.splice(nearestIndex, 1);
    sorted.push(nearest);
    current = nearest;
  }

  return sorted;
}

function chunkStores(stores: Store[]) {
  const chunks: Store[][] = [];
  for (let index = 0; index < stores.length; index += STORES_PER_WALK) {
    chunks.push(stores.slice(index, index + STORES_PER_WALK));
  }
  return chunks;
}

function estimateRouteMiles(homeBase: HomeBase, stores: Store[]) {
  if (stores.length === 0) {
    return 0;
  }

  let miles = 0;
  let current: Point = homeBase;

  stores.forEach((store) => {
    miles += getDistanceMiles(current, store);
    current = store;
  });

  return Math.round(miles + getDistanceMiles(current, homeBase));
}

function isLocalStore(homeBase: HomeBase, store: Store) {
  return store.routeGroup === "Local MD/DC" || getDistanceMiles(homeBase, store) <= LOCAL_RADIUS_MILES;
}

function groupTravelStores(stores: Store[]) {
  return stores.reduce<Record<string, Store[]>>((groups, store) => {
    const routeGroup = store.routeGroup;
    groups[routeGroup] = [...(groups[routeGroup] || []), store];
    return groups;
  }, {});
}

export function buildSmartWalkPlan(stores: Store[], homeBase: HomeBase): SmartWalkWeek[] {
  const walkStores = stores.filter((store) => store.requiresMonthlyWalk);
  const localStores = sortNearestNeighbor(walkStores.filter((store) => isLocalStore(homeBase, store)), homeBase);
  const travelStores = walkStores.filter((store) => !isLocalStore(homeBase, store));
  const localChunks = chunkStores(localStores);

  const travelTrips = Object.entries(groupTravelStores(travelStores))
    .map(([routeGroup, routeStores]) => ({
      routeGroup: routeGroup as RouteGroup,
      chunks: chunkStores(sortNearestNeighbor(routeStores, homeBase)),
      nearestMiles: Math.min(...routeStores.map((store) => getDistanceMiles(homeBase, store))),
    }))
    .sort((first, second) => first.nearestMiles - second.nearestMiles)
    .flatMap((trip) => {
      const pairs: Array<{ routeGroup: RouteGroup; chunks: Store[][] }> = [];
      for (let index = 0; index < trip.chunks.length; index += 2) {
        pairs.push({ routeGroup: trip.routeGroup, chunks: trip.chunks.slice(index, index + 2) });
      }
      return pairs;
    });

  const weekCount = Math.max(Math.ceil(localChunks.length / LOCAL_WEEKDAYS.length), travelTrips.length, 1);
  const weeks: SmartWalkWeek[] = [];

  for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
    const weekNumber = weekIndex + 1;
    const days: SmartWalkBlock[] = [];

    LOCAL_WEEKDAYS.forEach((dayName, dayIndex) => {
      const storesForDay = localChunks[weekIndex * LOCAL_WEEKDAYS.length + dayIndex] || [];
      if (storesForDay.length === 0) {
        return;
      }

      days.push({
        id: `week-${weekNumber}-${dayName}`,
        weekNumber,
        dayName,
        dayType: "local",
        title: "Local walk",
        routeGroup: "Local MD/DC",
        guidance: "Stay close to home base and keep the day to three or four nearby stores.",
        stores: storesForDay,
        estimatedMiles: estimateRouteMiles(homeBase, storesForDay),
      });
    });

    const travelTrip = travelTrips[weekIndex];
    if (travelTrip) {
      const [fridayStores, saturdayStores] = travelTrip.chunks;
      if (fridayStores) {
        days.push({
          id: `week-${weekNumber}-Friday-${travelTrip.routeGroup}`,
          weekNumber,
          dayName: "Friday",
          dayType: "travel",
          title: `${travelTrip.routeGroup} travel cluster`,
          routeGroup: travelTrip.routeGroup,
          guidance: saturdayStores
            ? "Start the outside cluster and plan to stay overnight before the Saturday walk."
            : "Handle this outside cluster as a focused day trip.",
          stores: fridayStores,
          estimatedMiles: estimateRouteMiles(homeBase, fridayStores),
        });
      }

      if (saturdayStores) {
        days.push({
          id: `week-${weekNumber}-Saturday-${travelTrip.routeGroup}`,
          weekNumber,
          dayName: "Saturday",
          dayType: "travel",
          title: `${travelTrip.routeGroup} second walk`,
          routeGroup: travelTrip.routeGroup,
          guidance: "Use this as the second walk in the same outside zone, then return home.",
          stores: saturdayStores,
          estimatedMiles: estimateRouteMiles(homeBase, saturdayStores),
        });
      }
    }

    weeks.push({ weekNumber, days });
  }

  return weeks;
}
