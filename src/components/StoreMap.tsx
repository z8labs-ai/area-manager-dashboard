import L from "leaflet";
import { MapContainer, Marker, Polygon, Popup, TileLayer, Tooltip } from "react-leaflet";
import { routeColors } from "../routeColors";
import type { HomeBase, Store } from "../types";
import { formatStoreLabel, getDirectionsUrl } from "../utils";
import { buildZoneBoundaries } from "../zoneBoundaries";

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
  html: '<span aria-hidden="true">&#9733;</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

export function StoreMap({ homeBase, stores, completed, onNavigate }: StoreMapProps) {
  const zoneBoundaries = buildZoneBoundaries(stores);

  return (
    <>
      <MapContainer center={[homeBase.lat, homeBase.lng]} zoom={9} scrollWheelZoom className="store-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {zoneBoundaries.map((zone) => (
          <Polygon
            key={zone.routeGroup}
            pathOptions={{
              color: routeColors[zone.routeGroup],
              dashArray: "8 8",
              fillColor: routeColors[zone.routeGroup],
              fillOpacity: 0.08,
              opacity: 0.8,
              weight: 3,
            }}
            positions={zone.positions}
          >
            <Tooltip sticky>
              {zone.routeGroup} zone, {zone.storeCount} monthly stores
            </Tooltip>
          </Polygon>
        ))}

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

      <section className="zone-legend" aria-label="Map zone legend">
        {zoneBoundaries.map((zone) => (
          <span key={zone.routeGroup}>
            <i style={{ backgroundColor: routeColors[zone.routeGroup] }} />
            {zone.routeGroup}
          </span>
        ))}
      </section>
    </>
  );
}
