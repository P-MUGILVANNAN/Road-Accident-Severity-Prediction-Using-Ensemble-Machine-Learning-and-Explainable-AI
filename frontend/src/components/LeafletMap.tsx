import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapPoint {
  id: number;
  index: string;
  lat: number;
  lng: number;
  severity: 'Slight' | 'Serious' | 'Fatal' | string;
  speed_limit: number;
  road_type: string;
  region?: string;
}

interface LeafletMapProps {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  points,
  center = [53.5, -1.8], // UK center
  zoom = 6,
  height = '500px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Update markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      points.forEach((p) => {
        if (!p.lat || !p.lng) return;

        let color = '#10b981'; // Slight (Emerald)
        let radius = 5;
        if (p.severity === 'Fatal') {
          color = '#e11d48'; // Fatal (Rose)
          radius = 8;
        } else if (p.severity === 'Serious') {
          color = '#f59e0b'; // Serious (Amber)
          radius = 6;
        }

        const marker = L.circleMarker([p.lat, p.lng], {
          radius: radius,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #0f172a;">${p.index}</strong><br/>
            <span style="font-weight: 600; color: ${color};">Severity: ${p.severity}</span><br/>
            <span>Speed Limit: ${p.speed_limit} mph</span><br/>
            <span>Road: ${p.road_type}</span><br/>
            <span>Region: ${p.region || 'National'}</span>
          </div>
        `);

        marker.addTo(markersLayerRef.current!);
      });
    }

    return () => {
      // Cleanup on unmount handled gracefully
    };
  }, [points, center, zoom]);

  // Adjust map size on container resize
  useEffect(() => {
    const handleResize = () => {
      mapInstanceRef.current?.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div ref={mapContainerRef} style={{ height: height, width: '100%' }} />
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-xs text-xs">
        <p className="font-semibold text-slate-700 mb-1">Collision Severity</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Slight</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-slate-600">Serious</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-600" />
            <span className="text-slate-600">Fatal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
