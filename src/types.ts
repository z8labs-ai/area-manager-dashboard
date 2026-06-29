export type RouteGroup = "North" | "South" | "East" | "West";

export type StoreBrand = "Home Depot" | "Academy Sports";

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
