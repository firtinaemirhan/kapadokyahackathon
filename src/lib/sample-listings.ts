export type WasteCategory =
  | "ceramic"
  | "food-byproduct"
  | "textile"
  | "grape-pomace"
  | "volcanic-tuff"
  | "pumpkin-shell"
  | "wood"
  | "metal"
  | "plastic"
  | "construction-rubble"
  | "agricultural"
  | "perlite-pumice"
  | "cheese-whey"
  | "olive-pomace";

export type VehicleType = "truck" | "van" | "rail" | "sea" | "buyer";

export type ListingType = "sell" | "buy";

export interface Listing {
  id: string;
  listingType?: ListingType;
  title: string;
  category: WasteCategory;
  city: string;
  district?: string;
  seller: string; // buy ilanlarında: alım talebinde bulunan firma
  tonnage: number; // ton
  pricePerTonTRY: number; // buy ilanlarında: hedef fiyat (0 = görüşülür)
  lat: number;
  lng: number;
  description: string;
  image: string;
  createdAt: string;
  vehicle: VehicleType;
  isUserCreated?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  createdBy?: string | null;
}

// Cappadocia & nearby coordinates (approximate, real)
export const SAMPLE_LISTINGS: Listing[] = [
  {
    id: "TRT-1001",
    title: "Sırlı Seramik Üretim Kırıkları — Yüksek Kalite",
    category: "ceramic",
    city: "Avanos",
    district: "Çanak Sokak",
    seller: "Avanos Çini Atölyesi Koop.",
    tonnage: 52,
    pricePerTonTRY: 1850,
    lat: 38.7156,
    lng: 34.8489,
    description:
      "Kızıl Irmak kili bazlı sırlı seramik üretim artıkları. Öğütüldükten sonra agrega, terrazzo ve yer karosu üretiminde kullanılabilir. Stok hazır.",
    image: "ceramic",
    createdAt: "2026-04-28",
    vehicle: "truck",
  },
  {
    id: "TRT-1002",
    title: "Üzüm Posası (Cibre) — Şarap Üretim Yan Ürünü",
    category: "grape-pomace",
    city: "Ürgüp",
    district: "Mustafapaşa",
    seller: "Kapadokya Bağ Evi",
    tonnage: 28,
    pricePerTonTRY: 2400,
    lat: 38.631,
    lng: 34.913,
    description:
      "Emir ve Öküzgözü hasadı sonrası kalan kuru cibre. Kozmetik (üzüm çekirdeği yağı), yem katkısı ve biyogaz fermentasyonu için uygundur.",
    image: "pomace",
    createdAt: "2026-04-30",
    vehicle: "truck",
  },
  {
    id: "TRT-1003",
    title: "Volkanik Tüf Toz ve Kırığı",
    category: "volcanic-tuff",
    city: "Nevşehir",
    district: "Göreme",
    seller: "Göreme Taş İşletmesi",
    tonnage: 120,
    pricePerTonTRY: 980,
    lat: 38.6431,
    lng: 34.8289,
    description:
      "Mağara oyma ve restorasyon işlerinden çıkan tüf kırığı. Hafif beton, puzolanik çimento katkısı ve peyzaj uygulamaları için ideal.",
    image: "tuff",
    createdAt: "2026-04-22",
    vehicle: "truck",
  },
  {
    id: "TRT-1004",
    title: "Tekstil Kırpıntısı — Pamuklu Karışım",
    category: "textile",
    city: "Niğde",
    district: "OSB",
    seller: "Niğde Tekstil A.Ş.",
    tonnage: 14,
    pricePerTonTRY: 3600,
    lat: 37.9667,
    lng: 34.6792,
    description:
      "Konfeksiyon kesim artığı, %80 pamuk %20 polyester. Geri dönüştürülmüş iplik, dolgu ve akustik panel üretimi için.",
    image: "textile",
    createdAt: "2026-05-01",
    vehicle: "van",
  },
  {
    id: "TRT-1005",
    title: "Kabak Çekirdeği Kabuğu — Biyokütle",
    category: "pumpkin-shell",
    city: "Nevşehir",
    district: "Gülşehir",
    seller: "Gülşehir Çekirdek Koop.",
    tonnage: 18,
    pricePerTonTRY: 1450,
    lat: 38.7472,
    lng: 34.6253,
    description:
      "Kavurma sonrası ayrılan kabuklar. Pelet, biyokömür ve aktif karbon hammaddesi olarak değerlendirilir.",
    image: "pumpkin",
    createdAt: "2026-04-15",
    vehicle: "truck",
  },
  {
    id: "TRT-1006",
    title: "Ahşap Palet ve Kereste Artığı",
    category: "wood",
    city: "Kayseri",
    district: "Mimarsinan OSB",
    seller: "Erciyes Mobilya San.",
    tonnage: 36,
    pricePerTonTRY: 2100,
    lat: 38.7522,
    lng: 35.4826,
    description:
      "Mobilya üretim hattı kesim artıkları. MDF, pelet ve dekoratif ahşap üretimi için sınıflandırılmış.",
    image: "wood",
    createdAt: "2026-04-26",
    vehicle: "truck",
  },
  {
    id: "TRT-1007",
    title: "Hurda Bakır Tel ve Kablo",
    category: "metal",
    city: "Kayseri",
    district: "OSB 2.Cad",
    seller: "Kayseri Geri Kazanım Ltd.",
    tonnage: 8,
    pricePerTonTRY: 285000,
    lat: 38.7392,
    lng: 35.4956,
    description:
      "Sanayi tipi temiz bakır tel. İhracat sertifikalıdır, LME bağlantılı fiyatlandırma uygundur.",
    image: "metal",
    createdAt: "2026-05-02",
    vehicle: "truck",
  },
  {
    id: "TRT-1008",
    title: "Çömlek Bisküvi Atığı — Pişmemiş Kil",
    category: "ceramic",
    city: "Avanos",
    seller: "Hanım Eli Çömlek",
    tonnage: 6,
    pricePerTonTRY: 1200,
    lat: 38.7188,
    lng: 34.8521,
    description:
      "Pişme öncesi şekillendirme atıkları. Yeniden çamura dönüştürülerek kullanılabilir, sıfır enerji kaybı.",
    image: "ceramic",
    createdAt: "2026-04-29",
    vehicle: "van",
  },
  {
    id: "TRT-BUY-001",
    listingType: "buy",
    title: "Potasyum Karbonat / Potasyum Sülfat Atığı Arıyorum — Kayseri OSB Bölgesi",
    category: "agricultural",
    city: "Kayseri",
    district: "OSB",
    seller: "Orta Anadolu Gübre Kimya A.Ş.",
    tonnage: 5,
    pricePerTonTRY: 0,
    lat: 38.7522,
    lng: 35.4826,
    description:
      "2026 ESG sürdürülebilirlik raporumuz kapsamında tedarik zincirindeki karbon ayak izini düşürmek amacıyla yakın bölgeden potasyum bazlı atık veya yan ürün arıyoruz. Gübre üretimi sırasında çıkan potasyum karbonat, potasyum sülfat veya potasyum içerikli proses artığı olabilir. Miktar: 5 ton. Fiyat görüşülür. Lojistik tarafımızdan karşılanacaktır.",
    image: "metal",
    createdAt: "2026-05-03",
    vehicle: "buyer",
  },
];

export const CATEGORY_LABELS: Record<WasteCategory, string> = {
  ceramic: "Seramik",
  "food-byproduct": "Gıda İşleme Yan Ürünü",
  textile: "Tekstil",
  "grape-pomace": "Üzüm Posası",
  "volcanic-tuff": "Volkanik Tüf",
  "pumpkin-shell": "Kabak Kabuğu",
  wood: "Ahşap",
  metal: "Metal",
  plastic: "Plastik",
  "construction-rubble": "İnşaat Molozu",
  agricultural: "Tarım Atığı",
  "perlite-pumice": "Perlit / Pomza",
  "cheese-whey": "Peyniraltı Suyu",
  "olive-pomace": "Zeytin Pirinası",
};

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  truck: "TIR",
  van: "Kamyonet",
  rail: "Demiryolu",
  sea: "Denizyolu",
  buyer: "Alıcı Taşır",
};

// Default buyer location: Kayseri OSB
export const DEFAULT_BUYER = {
  city: "Kayseri OSB",
  lat: 38.7392,
  lng: 35.4956,
};
