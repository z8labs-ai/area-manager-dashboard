import type { RouteGroup } from "./types";

export const routeColors: Record<RouteGroup, string> = {
  "Local MD/DC": "#2563eb",
  "Baltimore/North MD": "#0891b2",
  "Western MD/WV": "#9333ea",
  "Northern VA": "#16a34a",
  "Southern VA": "#dc2626",
  "Pennsylvania/Delaware": "#f59e0b",
  "Non-Walk": "#64748b",
};

export const routeGroups = Object.keys(routeColors) as RouteGroup[];
