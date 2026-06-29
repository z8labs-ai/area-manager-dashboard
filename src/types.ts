export type RouteGroup =
  | "Local MD/DC"
  | "Baltimore/North MD"
  | "Western MD/WV"
  | "Northern VA"
  | "Southern VA"
  | "Pennsylvania/Delaware"
  | "Non-Walk";

export type StoreBrand =
  | "Home Depot"
  | "Academy"
  | "Bill's"
  | "Ace"
  | "Cabela's"
  | "Tractor Supply"
  | "HD DFC";

export type Store = {
  id: string;
  brand: StoreBrand;
  storeNumber: string;
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  routeGroup: RouteGroup;
  requiresMonthlyWalk: boolean;
  phone?: string;
};

export type HomeBase = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export type StoreData = {
  homeBase: HomeBase;
  stores: Store[];
};

export type CompletionStatus = Record<string, boolean>;

export type StoreNotes = Record<string, string>;

export type CompletionFilter = "all" | "complete" | "incomplete";

export type WalkFilter = "all" | "required" | "not-required";
