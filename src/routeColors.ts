import type { RouteGroup } from "./types";

export const routeColors: Record<RouteGroup, string> = {
  North: "#2563eb",
  South: "#16a34a",
  East: "#dc2626",
  West: "#9333ea",
};

export const routeGroups = Object.keys(routeColors) as RouteGroup[];
