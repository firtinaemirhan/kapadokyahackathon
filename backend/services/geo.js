export function haversineKm(from, to) {
  const [fromLng, fromLat] = from;
  const [toLng, toLat] = to;
  const radiusKm = 6371;
  const toRad = (degree) => (degree * Math.PI) / 180;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const lat1 = toRad(fromLat);
  const lat2 = toRad(toLat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * radiusKm * Math.asin(Math.sqrt(h));
}

export function isValidLngLat(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1])) &&
    Math.abs(Number(value[0])) <= 180 &&
    Math.abs(Number(value[1])) <= 90
  );
}

export function normalizeLngLat(value) {
  if (!isValidLngLat(value)) {
    throw new Error("Koordinat [lng, lat] formatında olmalı.");
  }

  return [Number(value[0]), Number(value[1])];
}

export function normalizeLatLngObject(value) {
  if (!value || !Number.isFinite(Number(value.lat)) || !Number.isFinite(Number(value.lng))) {
    throw new Error("Konum { lat, lng } formatında olmalı.");
  }

  return [Number(value.lng), Number(value.lat)];
}
