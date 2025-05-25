import { useEffect, useState } from "react";

export default function useLocation() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(pos.coords),
      (err) => console.error("Location error:", err)
    );
  }, []);

  return location;
}
