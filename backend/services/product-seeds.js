export const SEED_PRODUCTS = [
  {
    id: "seed-seker-pancari",
    productName: "Şeker Pancarı",
    byproducts: ["Melas", "pancar posası (küspe)", "yaprak ve baş kısımları", "kireçleme çamuru"],
  },
  {
    id: "seed-patates",
    productName: "Patates",
    byproducts: [
      "Yumru kabukları",
      "nişasta üretim atığı (pulpa)",
      "hasat sonrası sap ve yapraklar",
    ],
  },
  {
    id: "seed-buyukbas-kucukbas",
    productName: "İnek / Koyun / Kıl Keçisi",
    byproducts: [
      "Gübre",
      "idrar",
      "kesim sonrası deri/yün/boynuz parçaları",
      "süt işleme atığı (peynir altı suyu)",
    ],
  },
  {
    id: "seed-tahil",
    productName: "Buğday / Arpa / Yulaf",
    byproducts: ["Saman", "kesmik", "kavuz (dış kabuk)", "un üretimi sonrası kepek"],
  },
  {
    id: "seed-yonca",
    productName: "Yonca",
    byproducts: ["Hasat ve kurutma sırasında dökülen yapraklar", "sap artıkları"],
  },
  {
    id: "seed-domates",
    productName: "Domates",
    byproducts: ["Kabuk", "çekirdek", "posa (salça yapımında)", "kuruyan dal ve yapraklar"],
  },
  {
    id: "seed-cerezlik-kabak",
    productName: "Çerezlik Kabak",
    byproducts: ["Kabuk", "iç etli doku (çekirdek ayrıldıktan sonra kalan kısım)"],
  },
  {
    id: "seed-sarimsak",
    productName: "Sarımsak",
    byproducts: ["Dış kuru kabuklar", "saplar", "kök püskülleri"],
  },
  {
    id: "seed-misir",
    productName: "Mısır",
    byproducts: ["Mısır koçanı", "mısır sapı", "yapraklar", "püskül"],
  },
  {
    id: "seed-uzum",
    productName: "Üzüm",
    byproducts: ["Cibre (kabuk ve çekirdek)", "salkım sapları", "budama artıkları (çotak)"],
  },
  {
    id: "seed-elma-kayisi",
    productName: "Elma / Kayısı",
    byproducts: ["Çekirdek", "meyve posası", "kabuklar", "ağaç budama artıkları"],
  },
  {
    id: "seed-kuru-fasulye",
    productName: "Kuru Fasulye",
    byproducts: ["Fasulye kapsülleri (kabuklar)", "kurumuş sap ve yapraklar"],
  },
  {
    id: "seed-sut",
    productName: "Süt",
    byproducts: ["Peynir altı suyu (peynir üretiliyorsa)", "yıkama suları"],
  },
  {
    id: "seed-bal",
    productName: "Bal",
    byproducts: ["Balmumu artıkları", "propolis kalıntıları", "arı ölüleri"],
  },
  {
    id: "seed-yumurta",
    productName: "Yumurta",
    byproducts: ["Yumurta kabukları", "kirli altlık (kümeslerde)", "bozuk/döllenmemiş yumurtalar"],
  },
].map((product) => ({
  ...product,
  isAgricultural: true,
  source: "seed",
  createdBy: null,
  createdAt: "2026-05-02T00:00:00.000Z",
}));
