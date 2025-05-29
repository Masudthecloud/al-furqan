// src/pages/Qibla.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Compass, MapPin, Locate, RefreshCw, Info } from 'lucide-react';

const KAABA = { lat: 21.422487, lng: 39.826206 };

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

function calculateQiblaDirection(lat: number, lng: number): number {
  const φ1 = toRad(lat);
  const λ1 = toRad(lng);
  const φ2 = toRad(KAABA.lat);
  const λ2 = toRad(KAABA.lng);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  let brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

const QiblaPage: React.FC = () => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [bearing, setBearing] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [distance, setDistance] = useState<number>(0);
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false);
  const compassRef = useRef<HTMLDivElement>(null);

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getLocation = () => {
    setIsLoading(true);
    setError('');
    setPermissionRequested(true);
    
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        const newBearing = calculateQiblaDirection(latitude, longitude);
        setBearing(newBearing);
        setDistance(calculateDistance(latitude, longitude, KAABA.lat, KAABA.lng));
        setIsLoading(false);
        
        // Smooth rotation animation
        if (compassRef.current) {
          compassRef.current.style.transition = 'transform 1s ease-out';
          setTimeout(() => {
            if (compassRef.current) {
              compassRef.current.style.transition = 'transform 0.2s ease-out';
            }
          }, 1000);
        }
      },
      (err) => {
        let errorMessage = err.message;
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = 'Please enable location permissions in your browser settings to use this feature.';
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Check if geolocation is supported when component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
        <h1 className="text-4xl font-bold mb-3 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
          Qibla Direction
        </h1>
        
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8 text-lg">
          Find the direction to the Kaaba in Makkah
        </p>

        {!permissionRequested && !position && !error && (
          <div className="flex flex-col items-center justify-center py-12">
            <button
              onClick={getLocation}
              className="flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Locate className="w-6 h-6 mr-3" />
              Find My Direction
            </button>
            <p className="mt-6 text-gray-500 dark:text-gray-400 text-center max-w-sm">
              We'll ask for your location permission to calculate the Qibla direction
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-6 mb-6 rounded-xl">
            <p className="font-medium">{error}</p>
            <button 
              onClick={getLocation}
              className="mt-3 flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-6"></div>
            <p className="text-gray-700 dark:text-gray-300 text-lg">Locating your position…</p>
          </div>
        )}

        {position && !isLoading && (
          <>
            <div className="relative w-80 h-80 mb-10 mx-auto">
              {/* Compass Dial */}
              <div className="absolute inset-0 rounded-full border-8 border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-inner bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm">
                <Compass className="w-64 h-64 text-gray-300 dark:text-gray-600" />
                {/* Cardinal directions */}
                <span className="absolute top-3 text-gray-700 dark:text-gray-200 font-bold text-lg">N</span>
                <span className="absolute bottom-3 text-gray-700 dark:text-gray-200 font-bold text-lg">S</span>
                <span className="absolute left-3 text-gray-700 dark:text-gray-200 font-bold text-lg">W</span>
                <span className="absolute right-3 text-gray-700 dark:text-gray-200 font-bold text-lg">E</span>
              </div>
              
              {/* Qibla Arrow with Kaaba Icon */}
              <div
                ref={compassRef}
                className="absolute top-1/2 left-1/2 w-3 h-40 bg-gradient-to-t from-red-600 to-red-400 origin-bottom rounded-full shadow-lg"
                style={{
                  transform: `translate(-50%, -100%) rotate(${bearing}deg)`,
                }}
              >
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full flex flex-col items-center">
                  <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center shadow-xl mb-1">
                    <span className="text-white text-2xl">🕋</span>
                  </div>
                  <div className="w-0 h-0 border-l-10 border-r-10 border-b-10 border-l-transparent border-r-transparent border-b-red-600"></div>
                </div>
              </div>
              
              {/* You Are Here Pin */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <MapPin className="w-10 h-10 text-indigo-600 dark:text-indigo-400 fill-current" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-8 shadow-inner">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Your Location</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Qibla Direction</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {bearing.toFixed(2)}° from North
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Distance to Kaaba</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {distance.toFixed(0)} km
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Kaaba Location</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {KAABA.lat}, {KAABA.lng}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={getLocation}
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Locate className="w-5 h-5 mr-2" />
                    Update Location
                  </>
                )}
              </button>
            </div>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <Info className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400" />
            <p>Face the Kaaba icon direction to pray towards the Holy Kaaba</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QiblaPage;