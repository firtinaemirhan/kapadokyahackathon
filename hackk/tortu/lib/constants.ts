import type { TransportMode } from "@/lib/types";
export const EMISSION_FACTORS: Record<TransportMode,{tr:string;en:string;factor:number}> = { air:{tr:"Hava Kargo",en:"Air Cargo",factor:0.5}, sea:{tr:"Deniz Yolu",en:"Sea Freight",factor:0.015}, road:{tr:"Kara (TIR)",en:"Road (Truck)",factor:0.1}, rail:{tr:"Demiryolu",en:"Rail",factor:0.03} };
export const DEFAULT_CARBON_PRICE_TRY_PER_TON = 350;
export const KAPADOKYA_CENTER:[number,number] = [38.6431,34.8289];
export const DEFAULT_BUYER_LOCATION:[number,number] = [38.7205,35.4826];
export const NOMINATIM_USER_AGENT = process.env.NOMINATIM_USER_AGENT ?? "Tortu/1.0 (info@tortu.app)";
export const CATEGORY_LABELS = ["seramik atığı","gıda işleme yan ürünü","tekstil firesi","ahşap talaşı","metal hurdası","plastik atığı","inşaat molozu","tarım atığı","üzüm cibresi","perlit/pomza","peyniraltı suyu","zeytin pirinası"];
