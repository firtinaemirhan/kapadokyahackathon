import { useCallback, useEffect, useState } from "react";

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
  source: "gps" | "search" | "default";
}

export const DEFAULT_USER_LOC: UserLocation = {
  lat: 38.731,
  lng: 35.478,
  label: "Kayseri",
  source: "default",
};

export function useUserLocation() {
  const [location, setLocationState] = useState<UserLocation>(DEFAULT_USER_LOC);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "pending" | "ok" | "denied">("idle");

  const setLocation = useCallback((loc: UserLocation) => {
    setLocationState(loc);
  }, []);

  const requestGps = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    setGpsStatus("pending");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "GPS Konumunuz",
          source: "gps",
        });
        setGpsStatus("ok");
      },
      () => setGpsStatus("denied"),
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, [setLocation]);

  useEffect(() => {
    if (location.source === "default") requestGps();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { location, gpsStatus, requestGps, setLocation };
}
