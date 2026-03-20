import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { ShieldAlert, MapPin, AlertTriangle } from 'lucide-react';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const DEFAULT_CENTER = { lat: 37.42, lng: -122.08 };

interface SafetyMapProps {
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void;
  reports?: any[];
}

export default function SafetyMap({ onLocationSelect, reports = [] }: SafetyMapProps) {
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-zinc-100 rounded-3xl border-2 border-dashed border-zinc-200 p-8 text-center">
        <div className="max-w-xs">
          <MapPin size={48} className="mx-auto text-zinc-300 mb-4" />
          <h3 className="text-lg font-bold text-zinc-900">Google Maps API Key Required</h3>
          <p className="text-sm text-zinc-500 mt-2">
            To enable the safety map, please add your Google Maps API key in the AI Studio Secrets panel.
          </p>
          <div className="mt-4 p-3 bg-white rounded-xl border border-zinc-200 text-xs text-left">
            <p className="font-bold mb-1">How to add:</p>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400">
              <li>Open Settings (⚙️ gear icon)</li>
              <li>Select Secrets</li>
              <li>Add <code className="text-zinc-900">GOOGLE_MAPS_PLATFORM_KEY</code></li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-xl shadow-zinc-200 border border-zinc-100 relative">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={DEFAULT_CENTER}
          center={userLocation || DEFAULT_CENTER}
          defaultZoom={12}
          mapId="DEMO_MAP_ID"
          {...({ internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'] } as any)}
          style={{ width: '100%', height: '100%' }}
          onClick={(e) => {
            if (e.detail.latLng && onLocationSelect) {
              onLocationSelect({
                lat: e.detail.latLng.lat,
                lng: e.detail.latLng.lng,
              });
            }
          }}
        >
          {/* User Location Marker */}
          {userLocation && (
            <AdvancedMarker position={userLocation} title="You are here">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-8 h-8 bg-emerald-500/20 rounded-full animate-ping" />
                <div className="w-4 h-4 bg-emerald-600 rounded-full border-2 border-white shadow-lg" />
              </div>
            </AdvancedMarker>
          )}

          {/* Reports Markers */}
          {reports.map((report) => (
            <AdvancedMarker
              key={report.id}
              position={report.location}
              onClick={() => setSelectedReport(report)}
            >
              <Pin background="#ef4444" glyphColor="#fff">
                <AlertTriangle size={14} />
              </Pin>
            </AdvancedMarker>
          ))}

          {selectedReport && (
            <InfoWindow
              position={selectedReport.location}
              onCloseClick={() => setSelectedReport(null)}
            >
              <div className="p-2 max-w-[200px]">
                <h4 className="font-bold text-zinc-900 text-sm">{selectedReport.description.substring(0, 30)}...</h4>
                <p className="text-xs text-zinc-500 mt-1">Reported on {new Date(selectedReport.timestamp).toLocaleDateString()}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Suspicious Activity
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
      
      {/* Map Overlay Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-zinc-200 pointer-events-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Live Safety Map</span>
        </div>
      </div>
    </div>
  );
}
