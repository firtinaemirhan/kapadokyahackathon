import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CATEGORY_LABELS,
  VEHICLE_LABELS,
  type WasteCategory,
  type VehicleType,
  SAMPLE_LISTINGS,
  DEFAULT_BUYER,
} from "@/lib/sample-listings";
import { useFxRate } from "@/hooks/useFxRate";
import { useCarbonChain } from "@/hooks/useCarbonChain";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useBufferedCalculation } from "@/hooks/useBufferedCalculation";
import {
  classifyWaste,
  createListing,
  createProduct,
  geocodeAddress,
  getProducts,
  type ProductType,
  type WasteSuggestion,
} from "@/lib/api-client";
import { getCityByName, TURKEY_CITIES } from "@/lib/turkey-data";
import {
  calculateTradeEstimate,
  effectiveTransportVehicle,
  estimateRoadKm,
  fmtTRY,
  fmtUSD,
} from "@/lib/tortu-utils";
import { imageForCategory } from "@/lib/listing-utils";
import {
  Leaf,
  Truck,
  Coins,
  CheckCircle2,
  ShoppingCart,
  Package,
  LoaderCircle,
} from "lucide-react";
import type { ListingType } from "@/lib/sample-listings";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "İlan Ver — Tortu" },
      {
        name: "description",
        content:
          "Üretim artığı materyalinizi 60 saniyede listeleyin. Tortu fiyat, mesafe ve karbon hesaplamasını sizin için yapsın.",
      },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const fx = useFxRate();
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [listingType, setListingType] = useState<ListingType>("sell");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WasteCategory>("ceramic");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedByproduct, setSelectedByproduct] = useState("");
  const [productStatus, setProductStatus] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [newByproductsText, setNewByproductsText] = useState("");
  const [city, setCity] = useState("Nevşehir");
  const [tonnage, setTonnage] = useState(20);
  const [pricePerTon, setPricePerTon] = useState(2000);
  const [vehicle, setVehicle] = useState<VehicleType>("truck");
  const [description, setDescription] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("Kayseri Organize Sanayi Bölgesi");
  const [buyerLocation, setBuyerLocation] = useState(DEFAULT_BUYER);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<WasteSuggestion[]>([]);
  const [classificationSource, setClassificationSource] = useState<string | null>(null);
  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? products[0];
  const byproducts = selectedProduct?.byproducts ?? [];
  const activeProductId = selectedProduct?.id ?? "";
  const activeProductName = selectedProduct?.productName ?? "";
  const firstByproduct = selectedProduct?.byproducts[0] ?? "";

  const selectedCity = getCityByName(city);
  const seed = SAMPLE_LISTINGS.find((l) => l.city === city) ?? {
    ...SAMPLE_LISTINGS[0],
    city: selectedCity.name,
    lat: selectedCity.lat,
    lng: selectedCity.lng,
  };
  const carbonChain = useCarbonChain({
    from: [seed.lng, seed.lat],
    to: [buyerLocation.lng, buyerLocation.lat],
    weightTon: tonnage,
    mode: effectiveTransportVehicle(vehicle),
  });
  const estimatedKm = estimateRoadKm(buyerLocation, seed, effectiveTransportVehicle(vehicle));
  const km = carbonChain.data?.distanceKm ?? estimatedKm;
  const previewEstimate = calculateTradeEstimate({
    quantityTon: tonnage,
    unitPriceTRY: pricePerTon,
    distanceKm: km,
    vehicle,
  });
  const co2 = carbonChain.data?.co2Kg ?? previewEstimate.co2Kg;
  const totalUsd = fx.usdTry > 0 ? previewEstimate.totalCostTRY / fx.usdTry : null;
  const previewCalculationKey = [
    buyerLocation.lat.toFixed(6),
    buyerLocation.lng.toFixed(6),
    tonnage,
    pricePerTon,
    vehicle,
    city,
    km.toFixed(2),
  ].join("|");
  const previewIsCalculating = useBufferedCalculation(previewCalculationKey, carbonChain.loading);

  useEffect(() => {
    let active = true;
    getProducts()
      .then((result) => {
        if (!active) return;
        const nextProducts = result.products ?? [];
        setProducts(nextProducts);
        setSelectedProductId((current) => current || nextProducts[0]?.id || "");
        setSelectedByproduct((current) => current || nextProducts[0]?.byproducts[0] || "");
        setProductStatus(result.warning ?? null);
      })
      .catch((error) => {
        if (!active) return;
        setProductStatus(error instanceof Error ? error.message : "Ürün listesi alınamadı.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!activeProductId) return;
    setSelectedByproduct(firstByproduct);
    setCategory(inferCategory(activeProductName));
    if (!title) setTitle(`${activeProductName} yan ürünü`);
  }, [activeProductId, activeProductName, firstByproduct, title]);

  useEffect(() => {
    const text =
      `${title} ${selectedProduct?.productName ?? ""} ${selectedByproduct} ${description}`.trim();
    if (text.length < 12) {
      setSuggestions([]);
      setClassificationSource(null);
      return;
    }

    const id = window.setTimeout(() => {
      classifyWaste(text)
        .then((result) => {
          setSuggestions(result.suggestions);
          setClassificationSource(result.source);
        })
        .catch(() => {
          setSuggestions([]);
          setClassificationSource("unavailable");
        });
    }, 500);

    return () => window.clearTimeout(id);
  }, [title, selectedProduct?.productName, selectedByproduct, description]);

  const saveNewProduct = async () => {
    try {
      setProductStatus("Ürün kaydediliyor...");
      const result = await createProduct({
        productName: newProductName,
        byproducts: newByproductsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        createdBy: user?.id ?? null,
      });
      if (!result.product) throw new Error("Ürün yanıtı alınamadı.");
      setProducts((current) => [...current, result.product as ProductType]);
      setSelectedProductId(result.product.id);
      setSelectedByproduct(result.product.byproducts[0] ?? "");
      setNewProductName("");
      setNewByproductsText("");
      setProductStatus(result.warning ?? "Ürün eklendi.");
    } catch (error) {
      setProductStatus(error instanceof Error ? error.message : "Ürün eklenemedi.");
    }
  };

  const updateBuyerLocation = async () => {
    setGeoMessage("Nominatim ile konum aranıyor...");
    try {
      const result = await geocodeAddress(buyerAddress);
      setBuyerLocation({
        city: result.display.split(",")[0] ?? buyerAddress,
        lat: result.lat,
        lng: result.lng,
      });
      setGeoMessage(`${result.source}: ${result.display}`);
    } catch (err) {
      setGeoMessage(err instanceof Error ? err.message : "Konum bulunamadı.");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitError(null);
    setSubmitted(true);
    try {
      const defaultTitle =
        listingType === "buy"
          ? `${CATEGORY_LABELS[category]} arıyorum — ${selectedCity.name}`
          : `${activeProductName || CATEGORY_LABELS[category]} yan ürünü`;
      const result = await createListing({
        title: title.trim() || defaultTitle,
        category,
        city: selectedCity.name,
        seller: user.companyName,
        tonnage,
        pricePerTonTRY: pricePerTon,
        lat: seed.lat,
        lng: seed.lng,
        description:
          description.trim() ||
          `${selectedByproduct || activeProductName || CATEGORY_LABELS[category]} için yeni ilan.`,
        image: imageForCategory(category),
        vehicle,
        isUserCreated: true,
        contactEmail: user.email,
        contactPhone: user.phone,
        createdBy: user.id,
        listingType,
      });
      if (!result.listing) throw new Error("İlan yanıtı alınamadı.");
      const listingId = result.listing.id;
      if (result.warning) setProductStatus(result.warning);
      setTimeout(() => navigate({ to: "/listing/$id", params: { id: listingId } }), 900);
    } catch (error) {
      setSubmitted(false);
      setSubmitError(error instanceof Error ? error.message : "İlan yayınlanamadı.");
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border/60 bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Oturum gerekli
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold">İlan vermek için giriş yap</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Ürün, yan ürün ve lojistik verilerinin firma profiline bağlanması için önce profil
            hesabına giriş yapman gerekiyor.
          </p>
          <Link
            to="/auth"
            className="mt-7 inline-flex rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
          >
            Giriş / Kayıt Ekranına Git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
          İlan Paneli
        </div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold">
          {listingType === "buy" ? "Alım talebi oluştur" : "Atığını ilana dönüştür"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {listingType === "buy"
            ? "Ne aradığını, miktarını ve bölgeni belirt. Uygun tedarikçiler seninle iletişime geçsin."
            : "Birkaç bilgiyi gir, sistem fiyat-mesafe-karbon üçlüsünü senin için canlı hesaplasın."}
        </p>
      </div>

      {/* İlan tipi toggle */}
      <div className="mt-6 inline-flex rounded-xl border border-border/60 bg-card p-1 gap-1">
        {(
          [
            { key: "sell", label: "Satış İlanı", Icon: Package },
            { key: "buy", label: "Alım Talebi", Icon: ShoppingCart },
          ] as const
        ).map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setListingType(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              listingType === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {listingType === "buy" && (
        <div className="mt-4 rounded-lg border border-[var(--cave)]/30 bg-[var(--cave)]/5 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Alım talebi nedir?</strong> Satın almak istediğin
          malzemeyi, miktarı ve bölgeyi belirt. Tedarikçiler ilanını görüp seninle iletişime
          geçebilir. ESG raporlama veya sürdürülebilirlik hedefleri için idealdir.
        </div>
      )}

      <div className="mt-10 grid lg:grid-cols-[1.2fr_1fr] gap-10">
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Başlık">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                listingType === "buy"
                  ? "Örn. Potasyum karbonat atığı arıyorum — Kayseri OSB"
                  : "Örn. Sırlı seramik üretim kırıkları — yüksek kalite"
              }
              className="form-input"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Ürün türü">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="form-input"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.productName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Oluşan atık / yan ürün">
              <select
                value={selectedByproduct}
                onChange={(e) => setSelectedByproduct(e.target.value)}
                className="form-input"
              >
                {byproducts.map((byproduct) => (
                  <option key={byproduct} value={byproduct}>
                    {byproduct}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Kullanıcı tanımlı ürün
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tarımsal ürün adını ve yan ürünlerini virgülle ayırarak ekle.
                </p>
              </div>
              {productStatus && (
                <span className="text-xs text-muted-foreground">{productStatus}</span>
              )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[0.8fr_1.2fr_auto]">
              <input
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Örn. Nohut"
                className="form-input"
              />
              <input
                value={newByproductsText}
                onChange={(e) => setNewByproductsText(e.target.value)}
                placeholder="Kabuk, sap, elek altı kırık"
                className="form-input"
              />
              <button
                type="button"
                onClick={saveNewProduct}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Ekle
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Materyal kategorisi">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WasteCategory)}
                className="form-input"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Şehir / Bölge">
              <select value={city} onChange={(e) => setCity(e.target.value)} className="form-input">
                {TURKEY_CITIES.map((cityOption) => (
                  <option key={cityOption.name} value={cityOption.name}>
                    {cityOption.name} · {cityOption.region}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Alıcı / hedef adres (coğrafi veri)">
            <div className="flex gap-2">
              <input
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
                placeholder="Örn. Kayseri OSB"
                className="form-input"
              />
              <button
                type="button"
                onClick={updateBuyerLocation}
                className="px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold"
              >
                Konumla
              </button>
            </div>
            {geoMessage && <div className="mt-2 text-xs text-muted-foreground">{geoMessage}</div>}
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field
              label={`${listingType === "buy" ? "İstenen miktar (ton)" : "Miktar (ton)"}: ${tonnage}`}
            >
              <input
                type="range"
                min={1}
                max={200}
                value={tonnage}
                onChange={(e) => setTonnage(Number(e.target.value))}
                className="w-full accent-[var(--ember)]"
              />
            </Field>
            <Field
              label={
                listingType === "buy"
                  ? "Hedef birim fiyat (₺/ton) — 0 = görüşülür"
                  : "Birim fiyat (₺/ton)"
              }
            >
              <input
                type="number"
                min={0}
                value={pricePerTon}
                onChange={(e) => setPricePerTon(Number(e.target.value))}
                className="form-input font-mono"
              />
            </Field>
          </div>

          <Field label={listingType === "buy" ? "Teslim alma yöntemi" : "Taşımayı kim üstleniyor?"}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(VEHICLE_LABELS) as VehicleType[]).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setVehicle(v)}
                  className={`px-3 py-2.5 rounded-md border text-sm font-semibold transition-colors ${
                    vehicle === v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {VEHICLE_LABELS[v]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Açıklama">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                listingType === "buy"
                  ? "Neden bu malzemeye ihtiyacınız var? ESG/sürdürülebilirlik hedefleri, kullanım amacı, kalite kriterleri..."
                  : selectedByproduct
                    ? `${selectedByproduct} için nem, miktar, kullanım alanı ve depolama bilgisini yaz...`
                    : "Materyalin özelliklerini, hangi sektörlere uygun olduğunu kısaca açıkla..."
              }
              className="form-input resize-none"
            />
            {suggestions.length > 0 && (
              <div className="mt-2 rounded-lg border border-border/60 bg-card p-3 text-xs">
                <div className="font-semibold text-foreground">
                  AI kategori önerisi · {classificationSource}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => {
                    const slug = suggestion.slug as WasteCategory;
                    if (!CATEGORY_LABELS[slug]) return null;
                    return (
                      <button
                        type="button"
                        key={suggestion.slug}
                        onClick={() => setCategory(slug)}
                        className="rounded-full bg-secondary px-3 py-1 font-semibold text-muted-foreground hover:text-foreground"
                      >
                        {CATEGORY_LABELS[slug]} · %{Math.round(suggestion.score * 100)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Field>

          <button
            type="submit"
            disabled={submitted}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {submitted ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> İlan oluşturuldu! Yönlendiriliyor…
              </>
            ) : listingType === "buy" ? (
              "Alım Talebini Yayınla"
            ) : (
              "İlanı Yayınla"
            )}
          </button>
          {submitError ? (
            <div className="rounded-md bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
              {submitError}
            </div>
          ) : null}
        </form>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Canlı Önizleme
          </div>

          <div className="rounded-lg bg-card border border-border/60 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {selectedProduct?.productName ?? CATEGORY_LABELS[category]} ·{" "}
                {selectedByproduct || city}
              </div>
              {previewIsCalculating ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--moss-deep)]">
                  <LoaderCircle className="h-3 w-3 animate-spin" />
                  Hesaplanıyor
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--moss-deep)]">
                  Güncel
                </span>
              )}
            </div>
            <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">
              {title || "İlan başlığı önizlemesi"}
            </h3>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Stat
                icon={<Coins className="w-3.5 h-3.5" />}
                label="Toplam"
                value={
                  previewIsCalculating ? "Yükleniyor..." : fmtTRY(previewEstimate.totalCostTRY)
                }
                sub={
                  previewIsCalculating
                    ? "Hesaplanıyor"
                    : totalUsd
                      ? fmtUSD(totalUsd)
                      : "TCMB bekleniyor"
                }
              />
              <Stat
                icon={<Truck className="w-3.5 h-3.5" />}
                label="Mesafe"
                value={previewIsCalculating ? "Yükleniyor..." : `${km.toFixed(0)} km`}
                sub={previewIsCalculating ? "Hesaplanıyor" : VEHICLE_LABELS[vehicle]}
              />
              <Stat
                icon={<Leaf className="w-3.5 h-3.5 text-[var(--moss-deep)]" />}
                label="CO₂"
                value={previewIsCalculating ? "Yükleniyor..." : `${co2.toFixed(0)} kg`}
                sub={previewIsCalculating ? "Hesaplanıyor" : "taşıma"}
                highlight
              />
            </div>
            <div className="mt-4 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
              {previewIsCalculating
                ? "Fiyat, mesafe ve karbon bilgisi yükleniyor..."
                : `Ürün: ${fmtTRY(previewEstimate.materialTotalTRY)} · Taşıma: ${fmtTRY(
                    previewEstimate.transportCostTRY,
                  )} · ${buyerLocation.city} konumuna göre`}
              <br />
              {previewIsCalculating ? (
                "Canlı coğrafi karbon zinciri hesaplanıyor..."
              ) : carbonChain.data ? (
                <>
                  Zincir: {carbonChain.data.chain.join(" → ")} · Mesafe:{" "}
                  {carbonChain.data.sources.distance} · Kur: {carbonChain.data.sources.rates}
                  <br />
                  Faktör: {carbonChain.data.emissionFactor.factor} kg CO₂/ton-km · Karbon maliyeti:{" "}
                  {fmtTRY(carbonChain.data.carbonCost.TRY)}
                  <br />
                  Güncelleme:{" "}
                  {new Date(carbonChain.data.exchangeRate.fetchedAt).toLocaleString("tr-TR")}
                  {carbonChain.data.warnings.length
                    ? ` · ${carbonChain.data.warnings.join(" ")}`
                    : ""}
                </>
              ) : (
                `Canlı zincir alınamadı: ${carbonChain.error}`
              )}
            </div>
          </div>

          <div className="rounded-lg bg-[var(--cave)] text-background p-5 text-sm leading-relaxed">
            <div className="text-[10px] uppercase tracking-[0.18em] text-background/60 font-semibold">
              Tortu önerisi
            </div>
            <p className="mt-2 text-background/85">
              Bu materyal için <strong className="text-background">karbon optimal taşıma</strong>{" "}
              seçeneği {co2 < 1500 ? "uygun." : "için demiryolu/denizyolu değerlendirebilirsiniz."}{" "}
              Fiyat-bölge analizinize göre platform ortalamasına yakın bir konumdasınız.
            </p>
          </div>
        </aside>
      </div>

      <style>{`.form-input{width:100%;padding:0.7rem 0.9rem;border-radius:0.5rem;background:var(--card);border:1px solid var(--border);font-size:0.9rem;outline:none}.form-input:focus{box-shadow:0 0 0 3px color-mix(in oklab, var(--ring) 30%, transparent)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? "bg-[var(--moss)]/10" : "bg-secondary"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="font-mono font-semibold mt-0.5">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function inferCategory(productName: string): WasteCategory {
  const normalized = productName.toLocaleLowerCase("tr-TR");
  if (normalized.includes("üzüm")) return "grape-pomace";
  if (normalized.includes("süt")) return "cheese-whey";
  if (
    normalized.includes("mısır") ||
    normalized.includes("buğday") ||
    normalized.includes("arpa")
  ) {
    return "agricultural";
  }
  if (normalized.includes("bal") || normalized.includes("yumurta")) return "food-byproduct";
  if (normalized.includes("kabak")) return "pumpkin-shell";
  return "agricultural";
}
