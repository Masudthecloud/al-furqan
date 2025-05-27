import React, { useState, useEffect, type JSX } from 'react';
import {
  MapPin,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

type LocationType = 'current' | 'address' | null;

const calculationMethods = [
  { id: '2', name: 'ISNA (North America)' },
  { id: '1', name: 'Karachi (U. Islamic Sciences)' },
  { id: '3', name: 'MWL (Muslim World League)' },
  { id: '4', name: 'Umm Al-Qura (Makkah)' },
  { id: '5', name: 'Egyptian Authority' },
  { id: '7', name: 'Tehran (U. of Tehran)' },
];

const juristicOptions = [
  { id: '0', name: 'Shafiʻī' },
  { id: '1', name: 'Ḥanafī' },
];

export default function Prayer(): JSX.Element {
  const [address, setAddress] = useState<string>('');
  const [locationLabel, setLocationLabel] = useState<string>('');
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [gregorianDate, setGregorianDate] = useState<string>('');
  const [hijriDate, setHijriDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);

  const [calcMethod, setCalcMethod] = useState<string>(
    sessionStorage.getItem('prayer_calc_method') ?? '2'
  );
  const [juristicMethod, setJuristicMethod] = useState<string>(
    sessionStorage.getItem('prayer_juristic_method') ?? '0'
  );
  const [locationType, setLocationType] = useState<LocationType>(null);

  const iconMap: Record<string, JSX.Element> = {
    Fajr: <Sunrise size={20} className="text-blue-400 dark:text-blue-300" />,
    Sunrise: <Sun size={20} className="text-amber-400 dark:text-amber-300" />,
    Dhuhr: <Sun size={20} className="text-orange-500 dark:text-orange-400" />,
    Asr: <CloudSun size={20} className="text-red-500 dark:text-red-400" />,
    Maghrib: <Sunset size={20} className="text-purple-500 dark:text-purple-400" />,
    Isha: <Moon size={20} className="text-indigo-500 dark:text-indigo-400" />,
  };

  interface DateData {
    date: {
      gregorian: { weekday: { en: string }; month: { en: string }; day: string; year: string; };
      hijri:    { weekday: { en: string }; month: { en: string }; day: string; year: string; };
    };
  }

  const formatDates = (data: DateData) => {
    const g = data.date.gregorian;
    const h = data.date.hijri;
    setGregorianDate(`${g.weekday.en}, ${g.month.en} ${g.day}, ${g.year}`);
    setHijriDate(`${h.weekday.en}, ${h.month.en} ${h.day}, ${h.year}`);
  };

  const calculateNextPrayer = (t: PrayerTimings) => {
    const now = new Date();
    const hNow = now.getHours(), mNow = now.getMinutes();
    const slots = ['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(name => ({
      name, time: t[name] as string
    }));
    for (const p of slots) {
      const [time, period] = p.time.split(' ');
      // eslint-disable-next-line prefer-const
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      if (h > hNow || (h === hNow && m > mNow)) return p.name;
    }
    return 'Fajr';
  };

  const fetchPrayerTimes = async (date: Date) => {
    const ts = Math.floor(date.getTime() / 1000);
    let url = locationType === 'current'
      ? `https://api.aladhan.com/v1/timings/${ts}?latitude=${sessionStorage.getItem('prayer_lat')}&longitude=${sessionStorage.getItem('prayer_lng')}`
      : `https://api.aladhan.com/v1/timingsByAddress/${ts}?address=${encodeURIComponent(address)}`;
    url += `&method=${calcMethod}&school=${juristicMethod}`;

    try {
      setLoading(true);
      const res = await fetch(url);
      const json = await res.json();
      if (json.code !== 200) throw new Error(json.status);
      setTimings(json.data.timings);
      formatDates(json.data);
      setNextPrayer(calculateNextPrayer(json.data.timings));
      setError(null);
    } catch {
      setError('Failed to fetch prayer times. Please try again.');
      setTimings(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchByCoords = (lat: number, lng: number) => {
    sessionStorage.setItem('prayer_location_type', 'current');
    sessionStorage.setItem('prayer_lat', lat.toString());
    sessionStorage.setItem('prayer_lng', lng.toString());
    setLocationType('current');
    setLocationLabel('Current Location');
    fetchPrayerTimes(currentDate);
  };

  const fetchByAddress = (q: string) => {
    sessionStorage.setItem('prayer_location_type', 'address');
    sessionStorage.setItem('prayer_location', q);
    setLocationType('address');
    setLocationLabel(q);
    fetchPrayerTimes(currentDate);
  };

  useEffect(() => {
    const savedType = sessionStorage.getItem('prayer_location_type') as LocationType;
    const savedAddr = sessionStorage.getItem('prayer_location');
    if (savedType === 'address' && savedAddr) {
      setAddress(savedAddr);
      fetchByAddress(savedAddr);
    } else if (savedType === 'current') {
      const lat = parseFloat(sessionStorage.getItem('prayer_lat') || '');
      const lng = parseFloat(sessionStorage.getItem('prayer_lng') || '');
      if (!isNaN(lat) && !isNaN(lng)) fetchByCoords(lat, lng);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('prayer_calc_method', calcMethod);
    sessionStorage.setItem('prayer_juristic_method', juristicMethod);
    if (locationType) fetchPrayerTimes(currentDate);
  }, [calcMethod, juristicMethod, currentDate]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => setError('Please enable location access in your browser settings.')
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter a city or address.');
      return;
    }
    fetchByAddress(address.trim());
  };

  const changeDate = (days: number) => {
    const n = new Date(currentDate);
    n.setDate(n.getDate() + days);
    setCurrentDate(n);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Prayer Times
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Accurate prayer times based on your location
        </p>
      </div>

      {/* Calculation & Juristic */}
      <div className="grid grid-cols-2 gap-3">
        {[{
          id: 'calculation-method',
          label: 'Calculation Method',
          value: calcMethod,
          onChange: (v: string) => setCalcMethod(v),
          options: calculationMethods
        },{
          id: 'juristic-method',
          label: 'Juristic Method',
          value: juristicMethod,
          onChange: (v: string) => setJuristicMethod(v),
          options: juristicOptions
        }].map(({id,label,value,onChange,options}) => (
          <div key={id}>
            <label
              htmlFor={id}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {label}
            </label>
            <select
              id={id}
              value={value}
              onChange={e => onChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                         rounded-lg bg-white dark:bg-gray-800
                         text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {options.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex rounded-lg shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="px-4 bg-gray-100 dark:bg-gray-700
                     hover:bg-gray-200 dark:hover:bg-gray-600
                     border border-r-0 border-gray-300 dark:border-gray-600
                     flex items-center justify-center transition-colors"
        >
          <MapPin size={18} className="text-gray-600 dark:text-gray-300" />
        </button>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Enter city or address"
          className="flex-1 px-4 py-2 border-t border-b border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800
                     text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                     text-white font-medium transition-colors"
        >
          Search
        </button>
      </form>

      {/* Date Nav */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800
                      rounded-lg shadow p-3">
        <button
          onClick={() => changeDate(-1)}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2
                          text-gray-800 dark:text-gray-100 font-medium">
            <Calendar size={16} className="text-blue-500 dark:text-blue-300" />
            {gregorianDate ||
              currentDate.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
          </div>
          {hijriDate && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {hijriDate}
            </div>
          )}
        </div>
        <button
          onClick={() => changeDate(1)}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Prayer Times Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700
                        dark:from-blue-700 dark:to-blue-800 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Prayer Timings</h2>
              {locationLabel && (
                <p className="text-sm opacity-90 mt-1 flex items-center text-gray-100">
                  <MapPin size={14} className="mr-1" /> {locationLabel}
                </p>
              )}
            </div>
            {nextPrayer && (
              <div className="bg-blue-500 dark:bg-blue-600 px-3 py-1
                              rounded-full text-xs flex items-center text-white">
                <Clock size={14} className="mr-1" /> Next: {nextPrayer}
              </div>
            )}
          </div>
        </div>
        <div className="p-4">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          {error && (
            <div className="text-center py-4 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {timings && (
            <ul className="space-y-3">
              {(['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'] as const).map(name => (
                <li
                  key={name}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    nextPrayer === name
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-gray-900 dark:text-white'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {iconMap[name]}
                    <span className="font-medium">{name}</span>
                  </div>
                  <span className="font-semibold">{timings[name]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Using {calculationMethods.find(m => m.id === calcMethod)?.name} calculation
      </div>
    </div>
  );
}
