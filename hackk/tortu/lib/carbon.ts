import { EMISSION_FACTORS } from "@/lib/constants";
import type { TransportMode } from "@/lib/types";
export function calculateCO2(distanceKm:number, weightTon:number, mode:TransportMode){ return distanceKm*weightTon*EMISSION_FACTORS[mode].factor; }
export function marginTone(priceTry:number, usdTry:number, exportEligible:boolean){ if(!exportEligible) return "neutral" as const; const usd=priceTry/usdTry; if(usd>=45) return "green" as const; if(usd>=32) return "yellow" as const; return "red" as const; }
