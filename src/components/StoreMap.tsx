import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { routeColors } from "../routeColors";
import type { HomeBase, Store } from "../types";
import { formatStoreLabel, getDirectionsUrl } from "../utils";

type StoreMapProps = {
  homeBase: HomeBase;
  stores: Store[];
  completed: Record<string, boolean>;
  onNavigate: (page: string) => void;
};

function makeMarker(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<span style="background:${color}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

const homeIcon = L.divIcon({
  className: "custom-marker home-marker",
  html: "<span></span>",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

export function StoreMap({ homeBase, stores, completed, onNavigate }: StoreMapProps) {
  return (
    <MapContainer center={[homeBase.lat, homeBase.lng]} zoom={9} scrollWheelZoom className="store-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[homeBase.lat, homeBase.lng]} icon={homeIcon}>
        <Popup>
          <strong>{homeBase.name}</strong>
          <br />
          {homeBase.address}
        </Popup>
      </Marker>

      {stores.map((store) => (
        <Marker
          icon={makeMarker(routeColors[store.routeGroup])}
          key={store.id}
          position={[store.lat, store.lng]}
        >
          <Popup>
            <strong>{store.name}</strong>
            <br />
            {formatStoreLabel(store)}
            <br />
            {store.routeGroup} route
            <br />
            {store.requiresMonthlyWalk
              ? completed[store.id]
                ? "Complete this month"
                : "Not complete this month"
              : "No monthly walk required"}
            <div className="popup-actions">
              <button type="button" onClick={() => onNavigate(`store/${store.id}`)}>
                Details
              </button>
              <a href={getDirectionsUrl(homeBase, store)} target="_blank" rel="noreferrer">
                Directions
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
