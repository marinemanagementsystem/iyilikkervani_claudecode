import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/layout';
import { Card, Badge } from '../components/ui';
import { Search, Filter, MapPin, Phone, Navigation, Eye, Users, Calendar } from 'lucide-react';
import { Household, Region } from '../types';
import { clsx } from 'clsx';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for traffic light colors
const createColoredIcon = (color: 'red' | 'yellow' | 'green') => {
  const colors = {
    red: '#ef4444',
    yellow: '#eab308',
    green: '#22c55e'
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${colors[color]};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ${color === 'red' ? 'animation: pulse 1.5s infinite;' : ''}
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const redIcon = createColoredIcon('red');
const yellowIcon = createColoredIcon('yellow');
const greenIcon = createColoredIcon('green');

type TrafficLight = 'red' | 'yellow' | 'green';

// Map center controller component
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const Map: React.FC = () => {
  const navigate = useNavigate();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TrafficLight | 'all'>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.8028, 29.4307]); // Gebze
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [householdsSnap, regionsSnap] = await Promise.all([
        getDocs(query(collection(db, 'households'), where('status', '!=', 'archived'))),
        getDocs(collection(db, 'regions'))
      ]);

      setHouseholds(householdsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Household)));
      setRegions(regionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Region)));
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrafficLight = (lastAidDate: Timestamp | null, needLevel: number): TrafficLight => {
    if (!lastAidDate) return 'red';
    if (needLevel >= 5) return 'red';

    const now = new Date();
    const lastAid = lastAidDate.toDate();
    const diffDays = Math.floor((now.getTime() - lastAid.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 90) return 'red';
    if (diffDays >= 30) return 'yellow';
    return 'green';
  };

  const getDaysSinceAid = (lastAidDate: Timestamp | null): number => {
    if (!lastAidDate) return 999;
    const now = new Date();
    const lastAid = lastAidDate.toDate();
    return Math.floor((now.getTime() - lastAid.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getRegionName = (regionId: string) => {
    return regions.find(r => r.id === regionId)?.name || '-';
  };

  // Filter households with location data
  const householdsWithLocation = useMemo(() => {
    return households.filter(h => h.location?.lat && h.location?.lng);
  }, [households]);

  const filteredHouseholds = useMemo(() => {
    return householdsWithLocation.filter(h => {
      const status = calculateTrafficLight(h.lastAidDate, h.needLevel);
      const matchesSearch = searchTerm === '' ||
        h.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      const matchesRegion = filterRegion === 'all' || h.regionId === filterRegion;
      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [householdsWithLocation, searchTerm, filterStatus, filterRegion]);

  const statusCounts = useMemo(() => ({
    all: householdsWithLocation.length,
    red: householdsWithLocation.filter(h => calculateTrafficLight(h.lastAidDate, h.needLevel) === 'red').length,
    yellow: householdsWithLocation.filter(h => calculateTrafficLight(h.lastAidDate, h.needLevel) === 'yellow').length,
    green: householdsWithLocation.filter(h => calculateTrafficLight(h.lastAidDate, h.needLevel) === 'green').length
  }), [householdsWithLocation]);

  const getMarkerIcon = (household: Household) => {
    const status = calculateTrafficLight(household.lastAidDate, household.needLevel);
    switch (status) {
      case 'red': return redIcon;
      case 'yellow': return yellowIcon;
      case 'green': return greenIcon;
    }
  };

  const focusOnHousehold = (household: Household) => {
    if (household.location) {
      setMapCenter([household.location.lat, household.location.lng]);
      setMapZoom(16);
      setSelectedHousehold(household);
    }
  };

  const openGoogleMaps = (household: Household) => {
    if (household.location) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${household.location.lat},${household.location.lng}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header title="Harita" subtitle={`${householdsWithLocation.length} hane konumlu (${households.length - householdsWithLocation.length} konumsuz)`} />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Hane ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9 w-full text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-1">
              {(['all', 'red', 'yellow', 'green'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={clsx(
                    'flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors',
                    filterStatus === status
                      ? status === 'red' ? 'bg-red-500 text-white'
                        : status === 'yellow' ? 'bg-yellow-500 text-white'
                        : status === 'green' ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {status === 'all' ? 'Tumu' : statusCounts[status]}
                </button>
              ))}
            </div>

            {/* Region Filter */}
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="input-field w-full text-sm"
            >
              <option value="all">Tum Bolgeler</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Household List */}
          <div className="flex-1 overflow-y-auto">
            {filteredHouseholds.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                Konumlu hane bulunamadi
              </div>
            ) : (
              <div className="divide-y">
                {filteredHouseholds.map(household => {
                  const status = calculateTrafficLight(household.lastAidDate, household.needLevel);
                  const days = getDaysSinceAid(household.lastAidDate);
                  return (
                    <button
                      key={household.id}
                      onClick={() => focusOnHousehold(household)}
                      className={clsx(
                        'w-full p-3 text-left hover:bg-gray-50 transition-colors',
                        selectedHousehold?.id === household.id && 'bg-blue-50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={clsx(
                          'w-3 h-3 rounded-full mt-1 flex-shrink-0',
                          status === 'red' && 'bg-red-500',
                          status === 'yellow' && 'bg-yellow-500',
                          status === 'green' && 'bg-green-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{household.familyName}</p>
                          <p className="text-xs text-gray-500 truncate">{getRegionName(household.regionId)}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {household.adults + household.children}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {days === 999 ? 'Hic' : `${days}g`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <style>{`
            .custom-marker {
              background: transparent !important;
              border: none !important;
            }
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.7; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>

          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            zoomControl={true}
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredHouseholds.map(household => (
              <Marker
                key={household.id}
                position={[household.location!.lat, household.location!.lng]}
                icon={getMarkerIcon(household)}
                eventHandlers={{
                  click: () => setSelectedHousehold(household)
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-gray-900">{household.familyName}</h3>
                    <p className="text-xs text-gray-500 mb-2">{getRegionName(household.regionId)}</p>
                    <p className="text-xs text-gray-600 mb-3">{household.address}</p>

                    <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                      <div className="bg-gray-50 rounded p-1">
                        <p className="text-sm font-bold">{getDaysSinceAid(household.lastAidDate)}</p>
                        <p className="text-[10px] text-gray-500">Gun</p>
                      </div>
                      <div className="bg-gray-50 rounded p-1">
                        <p className="text-sm font-bold">{household.adults + household.children}</p>
                        <p className="text-[10px] text-gray-500">Kisi</p>
                      </div>
                      <div className="bg-gray-50 rounded p-1">
                        <p className="text-sm font-bold">{household.children}</p>
                        <p className="text-[10px] text-gray-500">Cocuk</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openGoogleMaps(household)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        <Navigation className="w-3 h-3" />
                        Yol Tarifi
                      </button>
                      <button
                        onClick={() => navigate(`/households/${household.id}/edit`)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                      >
                        <Eye className="w-3 h-3" />
                        Detay
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
            <p className="text-xs font-medium text-gray-700 mb-2">Durum</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Acil (90+ gun)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Bekliyor (30-90 gun)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Guncel (&lt;30 gun)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
