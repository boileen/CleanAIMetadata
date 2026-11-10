import React, { useState } from 'react';
import { Search, MapPin, Compass, ShieldAlert, Sparkles } from 'lucide-react';

const QUICK_LOCATIONS = [
  { name: 'Times Square, NYC', lat: 40.7580, lng: -73.9855, alt: 10 },
  { name: 'Eiffel Tower, Paris', lat: 48.8584, lng: 2.2945, alt: 35 },
  { name: 'Tokyo Tower, Japan', lat: 35.6586, lng: 139.7454, alt: 25 },
  { name: 'Big Ben, London', lat: 51.5007, lng: -0.1246, alt: 14 },
];

export default function MapPicker({ coordinates, onCoordinatesChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const latNum = Number(coordinates.latitude);
  const lngNum = Number(coordinates.longitude);
  const hasCoords =
    Number.isFinite(latNum) && String(coordinates.latitude).trim() !== '' &&
    Number.isFinite(lngNum) && String(coordinates.longitude).trim() !== '';
  const lat = hasCoords ? latNum : 37.7749;
  const lng = hasCoords ? lngNum : -122.4194;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // Simple client search simulation or Nominatim geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        setIsSearching(false);
        if (data && data.length > 0) {
          const first = data[0];
          onCoordinatesChange({
            latitude: parseFloat(parseFloat(first.lat).toFixed(6)),
            longitude: parseFloat(parseFloat(first.lon).toFixed(6)),
          });
        }
      })
      .catch(() => {
        setIsSearching(false);
      });
  };

  const applyQuickLocation = (loc) => {
    onCoordinatesChange({
      latitude: loc.lat,
      longitude: loc.lng,
      altitude: loc.alt,
    });
  };

  return (
    <div className="bg-white rounded-panel border border-subtle p-5 sm:p-6 shadow-subtle space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand" />
          <h3 className="font-bold text-base text-foreground tracking-tight">
            Pick Location on Map
          </h3>
        </div>
        <span className="text-[11px] font-mono text-muted">
          {hasCoords ? `Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°` : 'No coordinates set'}
        </span>
      </div>

      {/* Address / Landmark Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search town, landmark, city, or address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card-raised border border-subtle text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-sm shrink-0"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Interactive Map Canvas */}
      <div className="relative w-full h-[340px] sm:h-[400px] rounded-xl border border-subtle overflow-hidden bg-card-strong">
        {mapLoaded ? (
          <iframe
            title="OpenStreetMap Location Viewer"
            className="w-full h-full border-0 pointer-events-auto"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lng}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-card-raised">
            <Compass className="w-8 h-8 text-muted" />
            <p className="text-xs text-muted max-w-sm">
              Map area is held idle for privacy. Click below to load OpenStreetMap tiles.
            </p>
            <button
              type="button"
              onClick={() => setMapLoaded(true)}
              className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold shadow-sm"
            >
              Load the map
            </button>
          </div>
        )}

        {/* Floating Quick Preset Chips on Map Bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 overflow-x-auto pb-1 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-subtle/80 shadow-subtle text-[11px]">
          <span className="font-mono text-muted uppercase text-[10px] font-bold shrink-0 px-1">
            Presets:
          </span>
          {QUICK_LOCATIONS.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyQuickLocation(loc)}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-card-raised hover:bg-card-strong border border-subtle text-foreground font-medium transition-colors"
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Guarantee Note matching DeleteFootprints.ai */}
      <p className="text-[11px] text-muted leading-relaxed">
        <strong>Privacy Note:</strong> Loading the map renders OpenStreetMap tiles. Searching sends the place name you type. If you prefer zero network calls, enter numeric coordinates directly in the form inputs.
      </p>
    </div>
  );
}
