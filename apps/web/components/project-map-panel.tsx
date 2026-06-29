import type { MeasurementPoint } from "@northacoustics/shared";

export function ProjectMapPanel({ points }: { points: MeasurementPoint[] }) {
  if (!points.length) {
    return (
      <div className="map-panel">
        <div className="map-grid" />
        <div style={{ position: "relative", padding: 24 }}>No hay puntos para mostrar.</div>
      </div>
    );
  }

  const lats = points.map((point) => point.latitude);
  const lngs = points.map((point) => point.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return (
    <div className="map-panel">
      <div className="map-grid" />
      {points.map((point) => {
        const top = maxLat === minLat ? 50 : ((maxLat - point.latitude) / (maxLat - minLat)) * 80 + 10;
        const left = maxLng === minLng ? 50 : ((point.longitude - minLng) / (maxLng - minLng)) * 80 + 10;

        return (
          <div className="map-marker" key={point.id} style={{ left: `${left}%`, top: `${top}%` }}>
            {point.code}
            <small>{point.status}</small>
          </div>
        );
      })}
    </div>
  );
}

