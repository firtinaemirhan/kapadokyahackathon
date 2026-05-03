import type { Listing, VehicleType } from "./sample-listings";
import type { AuthUser, UserRole } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export type TransportMode = "road" | "rail" | "sea" | "air";

export interface ExchangeRates {
  USD_TRY: number;
  EUR_TRY: number;
  fetchedAt: string;
  source: string;
  stale?: boolean;
  warning?: string | null;
}

export interface CarbonChainResponse {
  distanceKm: number;
  durationMin: number | null;
  weightTon: number;
  mode: TransportMode;
  emissionFactor: {
    label: string;
    factor: number;
  };
  co2Kg: number;
  carbonCost: {
    TRY: number;
    USD: number;
    EUR: number;
  };
  exchangeRate: ExchangeRates;
  sources: {
    distance: string;
    rates: string;
  };
  warnings: string[];
  chain: string[];
}

export interface RouteDistanceResponse {
  distanceKm: number;
  durationMin: number | null;
  mode: TransportMode;
  source: string;
  dynamic: boolean;
  routeGeometry?: [number, number][];
}

export interface WasteSuggestion {
  slug: string;
  score: number;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  display: string;
  source: string;
}

export interface ProductType {
  id: string;
  productName: string;
  byproducts: string[];
  isAgricultural: boolean;
  createdBy: string | null;
  createdAt: string;
  source: string;
}

export interface ContactRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  seller: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  quantityTon: number;
  note: string;
  createdAt: string;
  buyerLocationLabel?: string;
  distanceKm?: number;
  co2Kg?: number;
  offerUnitPriceTRY?: number;
  materialTotalTRY?: number;
  transportCostTRY?: number;
  totalCostTRY?: number;
  vehicle?: VehicleType;
}

export interface ApiEnvelope<T> {
  source: string;
  warning?: string | null;
  user?: AuthUser;
  product?: ProductType;
  products?: ProductType[];
  listing?: Listing;
  listings?: Listing[];
  request?: ContactRequest;
}

export interface LiveApiCheck {
  id: string;
  name: string;
  ok: boolean;
  durationMs: number;
  source: string;
  sample: string | null;
  warning: string | null;
  fetchedAt?: string;
}

export interface LiveApiTestResponse {
  ok: boolean;
  startedAt: string;
  completedAt: string;
  checks: LiveApiCheck[];
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? `API hatası: ${response.status}`);
  }

  return data as T;
}

export function getExchangeRates() {
  return apiFetch<ExchangeRates>("/api/exchange-rates");
}

export function calculateCarbonChain(input: {
  from: [number, number];
  to: [number, number];
  weightTon: number;
  mode: TransportMode | VehicleType;
}) {
  return apiFetch<CarbonChainResponse>("/api/carbon/calculate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function calculateRouteDistance(input: {
  from: [number, number];
  to: [number, number];
  mode: TransportMode | VehicleType;
  includeGeometry?: boolean;
}) {
  return apiFetch<RouteDistanceResponse>("/api/route-distance", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function classifyWaste(text: string) {
  return apiFetch<{ suggestions: WasteSuggestion[]; source: string }>("/api/classify-waste", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function geocodeAddress(query: string) {
  return apiFetch<GeocodeResult>("/api/geocode", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export function getProducts() {
  return apiFetch<ApiEnvelope<ProductType[]>>("/api/products");
}

export function getLiveApiTests() {
  return apiFetch<LiveApiTestResponse>("/api/live-tests");
}

export function createProduct(input: {
  productName: string;
  byproducts: string[];
  createdBy?: string | null;
}) {
  return apiFetch<ApiEnvelope<ProductType>>("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getListings() {
  return apiFetch<ApiEnvelope<Listing[]>>("/api/listings");
}

export function getListing(id: string) {
  return apiFetch<ApiEnvelope<Listing>>(`/api/listings/${id}`);
}

export function createListing(
  input: Omit<Listing, "id" | "createdAt"> & { createdBy?: string | null },
) {
  return apiFetch<ApiEnvelope<Listing>>("/api/listings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteListing(id: string) {
  return apiFetch<{ deleted: boolean; source: string; warning?: string | null }>(
    `/api/listings/${id}`,
    {
      method: "DELETE",
    },
  );
}

export function createContactRequest(input: Omit<ContactRequest, "id" | "createdAt">) {
  return apiFetch<ApiEnvelope<ContactRequest>>("/api/contact-requests", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface ContactRequestsEnvelope {
  requests: ContactRequest[];
  source: string;
  warning?: string | null;
}

export function getMyContactRequests(buyerEmail: string) {
  return apiFetch<ContactRequestsEnvelope>(
    `/api/contact-requests?buyerEmail=${encodeURIComponent(buyerEmail)}`,
  );
}

export function signupUser(input: {
  fullName: string;
  companyName: string;
  email: string;
  role: UserRole;
  city: string;
  phone?: string;
}) {
  return apiFetch<ApiEnvelope<AuthUser>>("/api/users/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(input: { email: string; password?: string }) {
  return apiFetch<ApiEnvelope<AuthUser>>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateUser(id: string, input: Partial<AuthUser>) {
  return apiFetch<ApiEnvelope<AuthUser>>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
