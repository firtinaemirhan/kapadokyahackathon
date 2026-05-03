import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Leaf,
  Truck,
  MapPin,
  Calendar,
  Building2,
  TreePine,
  Send,
  Trash2,
  ShoppingCart,
  LoaderCircle,
  BookOpen,
} from "lucide-react";
import { useFxRate } from "@/hooks/useFxRate";
import { useCarbonChain } from "@/hooks/useCarbonChain";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useBufferedCalculation } from "@/hooks/useBufferedCalculation";
import {
  SAMPLE_LISTINGS,
  CATEGORY_LABELS,
  VEHICLE_LABELS,
  type Listing,
  type VehicleType,
} from "@/lib/sample-listings";
import { IMAGE_MAP } from "@/lib/image-map";
import {
  calculateTradeEstimate,
  DEFAULT_CARBON_PRICE_TRY_PER_TON,
  effectiveTransportVehicle,
  estimateRoadKm,
  fmtCurrency,
  fmtTRY,
  fmtUSD,
  treesEquivalent,
  type DisplayCurrency,
} from "@/lib/tortu-utils";
import { ListingsMap } from "@/components/ListingsMap";
import { LocationPicker } from "@/components/LocationPicker";
import { createContactRequest, deleteListing, getListing } from "@/lib/api-client";

export const Route = createFileRoute("/listing/$id")({
  loader: ({ params }): { listing: Listing | null; id: string } => {
    const listing = SAMPLE_LISTINGS.find((l) => l.id === params.id);
    return { listing: listing ?? null, id: params.id };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.listing?.title ?? "İlan"} — Tortu` },
      { name: "description", content: loaderData?.listing?.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl py-24 text-center">
      <h1 className="font-display text-4xl">İlan bulunamadı</h1>
      <Link to="/marketplace" className="mt-6 inline-block text-primary font-semibold">
        Pazaryerine dön
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl py-24 text-center">
      <h1 className="font-display text-3xl">Bir şeyler ters gitti</h1>
      <p className="mt-3 text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ListingDetail,
});

function ListingDetail() {
  const { listing: initialListing, id } = Route.useLoaderData() as {
    listing: Listing | null;
    id: string;
  };
  const [listing, setListing] = useState<Listing | null>(initialListing);
  const [checkedBackend, setCheckedBackend] = useState(Boolean(initialListing));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (initialListing) {
      setListing(initialListing);
      setCheckedBackend(true);
      return;
    }

    let active = true;
    setCheckedBackend(false);
    setLoadError(null);
    getListing(id)
      .then((result) => {
        if (!active) return;
        setListing(result.listing ?? null);
        setLoadError(result.warning ?? null);
      })
      .catch((error) => {
        if (!active) return;
        setListing(null);
        setLoadError(error instanceof Error ? error.message : "İlan alınamadı.");
      })
      .finally(() => {
        if (active) setCheckedBackend(true);
      });

    return () => {
      active = false;
    };
  }, [id, initialListing]);

  if (!checkedBackend) {
    return <div className="mx-auto max-w-2xl py-24 text-center">İlan yükleniyor...</div>;
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center">
        <h1 className="font-display text-4xl">İlan bulunamadı</h1>
        {loadError ? <p className="mt-3 text-muted-foreground">{loadError}</p> : null}
        <Link to="/marketplace" className="mt-6 inline-block text-primary font-semibold">
          Pazaryerine dön
        </Link>
      </div>
    );
  }

  return <ListingDetailContent listing={listing} />;
}

function ListingDetailContent({ listing }: { listing: Listing }) {
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const fx = useFxRate();
  const { location: buyerLoc, gpsStatus, requestGps, setLocation } = useUserLocation();

  const isBuy = listing.listingType === "buy";

  const [contactOpen, setContactOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const [contactBusy, setContactBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [targetCurrency, setTargetCurrency] = useState<Exclude<DisplayCurrency, "TRY">>("USD");
  const [buyerName, setBuyerName] = useState(user?.fullName ?? "");
  const [buyerEmail, setBuyerEmail] = useState(user?.email ?? "");
  const [buyerPhone, setBuyerPhone] = useState(user?.phone ?? "");
  const [quantityTon, setQuantityTon] = useState(Math.min(listing.tonnage, 10));
  const [offerUnitPriceTRY, setOfferUnitPriceTRY] = useState(listing.pricePerTonTRY);
  const buyerChoosesTransport = listing.vehicle === "buyer";
  const [offerVehicle, setOfferVehicle] = useState<VehicleType>("truck");
  const [note, setNote] = useState(
    `${listing.title} için ${Math.min(listing.tonnage, 10)} tonluk ön teklif almak istiyorum.`,
  );

  useEffect(() => {
    if (user?.fullName && !buyerName) setBuyerName(user.fullName);
    if (user?.email && !buyerEmail) setBuyerEmail(user.email);
    if (user?.phone && !buyerPhone) setBuyerPhone(user.phone);
  }, [buyerEmail, buyerName, buyerPhone, user?.email, user?.fullName, user?.phone]);

  const calculationVehicle = buyerChoosesTransport
    ? offerVehicle
    : effectiveTransportVehicle(listing.vehicle);

  // Carbon chain — reactive to buyer location and selected offer variables.
  const carbonChain = useCarbonChain({
    from: [listing.lng, listing.lat],
    to: [buyerLoc.lng, buyerLoc.lat],
    weightTon: quantityTon,
    mode: calculationVehicle,
  });

  // Distance and carbon for the current buyer location.
  const estimatedKm = useMemo(
    () => estimateRoadKm(buyerLoc, listing, calculationVehicle),
    [buyerLoc, listing, calculationVehicle],
  );
  const km = carbonChain.data?.distanceKm ?? estimatedKm;
  const tradeEstimate = calculateTradeEstimate({
    quantityTon,
    unitPriceTRY: offerUnitPriceTRY,
    distanceKm: km,
    vehicle: calculationVehicle,
  });
  const co2 = carbonChain.data?.co2Kg ?? tradeEstimate.co2Kg;
  const trees = treesEquivalent(co2);
  const usdTry = carbonChain.data?.exchangeRate.USD_TRY ?? fx.usdTry;
  const eurTry = carbonChain.data?.exchangeRate.EUR_TRY ?? fx.eurTry;
  const grandTotalUSD = usdTry > 0 ? tradeEstimate.totalCostTRY / usdTry : null;
  const grandTotalEUR = eurTry > 0 ? tradeEstimate.totalCostTRY / eurTry : null;
  const driveHours = ((carbonChain.data?.durationMin ?? (km / 65) * 60) / 60).toFixed(1);
  const priceCalculationKey = [
    buyerLoc.lat.toFixed(6),
    buyerLoc.lng.toFixed(6),
    quantityTon,
    offerUnitPriceTRY,
    calculationVehicle,
    km.toFixed(2),
  ].join("|");
  const carbonCalculationKey = [
    buyerLoc.lat.toFixed(6),
    buyerLoc.lng.toFixed(6),
    quantityTon,
    calculationVehicle,
    km.toFixed(2),
  ].join("|");
  const priceIsCalculating = useBufferedCalculation(priceCalculationKey, carbonChain.loading);
  const carbonIsCalculating = useBufferedCalculation(carbonCalculationKey, carbonChain.loading);
  const carbonCostTRY =
    carbonChain.data?.carbonCost.TRY ?? (co2 / 1000) * DEFAULT_CARBON_PRICE_TRY_PER_TON;
  const carbonCostTarget =
    carbonChain.data?.carbonCost[targetCurrency] ??
    (targetCurrency === "USD"
      ? usdTry > 0
        ? carbonCostTRY / usdTry
        : null
      : eurTry > 0
        ? carbonCostTRY / eurTry
        : null);

  const handleDelete = async () => {
    setDeleteBusy(true);
    setDeleteStatus(null);
    try {
      const result = await deleteListing(listing.id);
      setDeleteStatus(result.warning ?? "İlan silindi.");
      navigate({ to: "/marketplace" });
    } catch (error) {
      setDeleteStatus(error instanceof Error ? error.message : "İlan silinemedi.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleContactSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setContactBusy(true);
    setContactStatus(null);
    const transportNote = ` [Hesap: ${buyerLoc.label}, ${quantityTon} ton, ${fmtTRY(offerUnitPriceTRY)}/ton, ${km.toFixed(0)} km, ${VEHICLE_LABELS[calculationVehicle]}, ürün ${fmtTRY(tradeEstimate.materialTotalTRY)}, taşıma ${fmtTRY(tradeEstimate.transportCostTRY)}, toplam ${fmtTRY(tradeEstimate.totalCostTRY)}, CO₂ ${co2.toFixed(0)} kg]`;
    try {
      const result = await createContactRequest({
        listingId: listing.id,
        listingTitle: listing.title,
        seller: listing.seller,
        buyerName: buyerName.trim() || "Tortu alıcısı",
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim() || undefined,
        quantityTon,
        note: note.trim() + transportNote,
        buyerLocationLabel: buyerLoc.label,
        distanceKm: km,
        co2Kg: co2,
        offerUnitPriceTRY,
        materialTotalTRY: tradeEstimate.materialTotalTRY,
        transportCostTRY: tradeEstimate.transportCostTRY,
        totalCostTRY: tradeEstimate.totalCostTRY,
        vehicle: calculationVehicle,
      });
      if (!result.request) throw new Error("Talep yanıtı alınamadı.");
      setContactStatus(
        `Talep ${result.request.id.toUpperCase()} koduyla kaydedildi. Satıcı: ${listing.seller}.`,
      );
    } catch (error) {
      setContactStatus(error instanceof Error ? error.message : "Talep kaydedilemedi.");
    } finally {
      setContactBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Pazaryerine dön
      </Link>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
        {/* Left: image + description + map */}
        <div>
          <div className="rounded-lg overflow-hidden aspect-[16/10] bg-secondary">
            <img
              src={IMAGE_MAP[listing.image] ?? IMAGE_MAP.tuff}
              alt={listing.title}
              className="w-full h-full object-cover"
              width={1280}
              height={800}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-secondary text-xs font-semibold uppercase tracking-wider">
              {CATEGORY_LABELS[listing.category]}
            </span>
            {isBuy && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--cave)]/15 text-[var(--cave)] text-xs font-semibold uppercase tracking-wider">
                <ShoppingCart className="w-3 h-3" /> Alım Talebi
              </span>
            )}
            <span className="font-mono text-xs text-muted-foreground">#{listing.id}</span>
            {listing.isUserCreated ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteBusy}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--danger)]/30 px-2.5 py-1 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger)]/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleteBusy ? "Siliniyor" : "Sil"}
              </button>
            ) : null}
          </div>
          {deleteStatus ? (
            <div className="mt-3 rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground">
              {deleteStatus}
            </div>
          ) : null}

          <h1 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-tight">
            {listing.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {listing.city}
              {listing.district ? `, ${listing.district}` : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              {listing.seller}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {listing.createdAt}
            </span>
          </div>

          <p className="mt-6 text-base leading-relaxed text-foreground/80 max-w-2xl">
            {listing.description}
          </p>

          {/* Map — route updates with buyer location */}
          <div className="mt-10">
            <h2 className="font-display text-2xl font-semibold mb-1">Lojistik rotası</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Rota <strong>{buyerLoc.label}</strong> konumunuzdan hesaplanıyor.
            </p>
            <div className="rounded-lg overflow-hidden border border-border/60 h-[380px]">
              <ListingsMap
                listings={[listing]}
                highlightId={listing.id}
                showRouteTo={listing}
                buyerLocation={buyerLoc}
                className="w-full h-full"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  l: "Mesafe",
                  v: `${km.toFixed(0)} km`,
                  sub: carbonChain.data?.sources.distance ?? "tahmini",
                },
                { l: "Tahmini Süre", v: `${driveHours} sa`, sub: VEHICLE_LABELS[listing.vehicle] },
                { l: "Toplam Yük", v: `${listing.tonnage} ton`, sub: "tek sevkiyat" },
                { l: "Ton-Km", v: `${(listing.tonnage * km).toFixed(0)}`, sub: "lojistik birim" },
              ].map((m) => (
                <div key={m.l} className="rounded-lg bg-card border border-border/60 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {m.l}
                  </div>
                  <div className="font-display text-2xl font-semibold mt-1">{m.v}</div>
                  <div className="text-xs text-muted-foreground">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: location-aware price + carbon + offer panel */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          {/* Location picker */}
          <LocationPicker
            location={buyerLoc}
            gpsStatus={gpsStatus}
            onRequestGps={requestGps}
            onSetLocation={setLocation}
            distanceKm={km}
            label="Alıcı Konumu"
          />

          {/* Price breakdown card */}
          <div className="relative rounded-lg bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {isBuy ? "Tedarik teklifi hesabı" : "Anlık teklif hesabı"}
              </div>
              <CalculationStatus active={priceIsCalculating} label="Fiyat hesaplanıyor" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Miktar (ton)
                </span>
                <input
                  type="number"
                  min={1}
                  max={listing.tonnage}
                  value={quantityTon}
                  onChange={(event) => setQuantityTon(Number(event.target.value))}
                  className="contact-input font-mono"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                  {isBuy ? "Teklif birim fiyatı" : "Birim teklif"}
                </span>
                <input
                  type="number"
                  min={0}
                  value={offerUnitPriceTRY}
                  onChange={(event) => setOfferUnitPriceTRY(Number(event.target.value))}
                  className="contact-input font-mono"
                />
              </label>
            </div>
            {buyerChoosesTransport ? (
              <div className="mt-3">
                <div className="mb-2 text-xs font-semibold text-muted-foreground">
                  Taşıma aracını seç
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(VEHICLE_LABELS) as VehicleType[])
                    .filter((v) => v !== "buyer")
                    .map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setOfferVehicle(v)}
                        className={`px-3 py-2 rounded-md border text-xs font-semibold transition-colors ${
                          offerVehicle === v
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {VEHICLE_LABELS[v]}
                      </button>
                    ))}
                </div>
              </div>
            ) : null}
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between rounded-lg bg-secondary px-3 py-2">
                <span className="text-muted-foreground">Ürün bedeli</span>
                <span className="font-mono font-semibold">
                  {priceIsCalculating ? <LoadingText /> : fmtTRY(tradeEstimate.materialTotalTRY)}
                </span>
              </div>
              <div className="flex justify-between rounded-lg bg-secondary px-3 py-2">
                <span className="text-muted-foreground">
                  {priceIsCalculating
                    ? "Taşıma hesaplanıyor"
                    : `Taşıma · ${km.toFixed(0)} km · ${fmtCurrency(
                        tradeEstimate.transportRateTRY,
                        "TRY",
                        2,
                      )}/ton-km`}
                </span>
                <span className="font-mono font-semibold">
                  {priceIsCalculating ? <LoadingText /> : fmtTRY(tradeEstimate.transportCostTRY)}
                </span>
              </div>
            </div>
            <div className="mt-3 border-t border-border/60 pt-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Toplam (ürün + konuma göre taşıma)
              </div>
              <div className="mt-1 font-display text-3xl font-semibold">
                {priceIsCalculating ? (
                  <LoadingText label="Yükleniyor" />
                ) : (
                  fmtTRY(tradeEstimate.totalCostTRY)
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-sm">
                <div className="rounded-lg bg-secondary px-3 py-2">
                  <div className="text-[10px] text-muted-foreground uppercase">USD</div>
                  <div className="font-semibold">
                    {priceIsCalculating ? (
                      <LoadingText />
                    ) : grandTotalUSD ? (
                      fmtUSD(grandTotalUSD)
                    ) : (
                      "TCMB bekleniyor"
                    )}
                  </div>
                </div>
                <div className="rounded-lg bg-secondary px-3 py-2">
                  <div className="text-[10px] text-muted-foreground uppercase">EUR</div>
                  <div className="font-semibold">
                    {priceIsCalculating ? (
                      <LoadingText />
                    ) : grandTotalEUR ? (
                      fmtCurrency(grandTotalEUR, "EUR")
                    ) : (
                      "TCMB bekleniyor"
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              İlanın sabit fiyatı baz ürün fiyatıdır; toplam maliyet seçilen konum, miktar ve taşıma
              aracına göre anlık hesaplanır.
            </div>
          </div>

          {/* Carbon card */}
          <div className="rounded-lg border border-primary/25 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_24%,var(--card)),color-mix(in_oklab,var(--moss)_14%,var(--card)))] p-6 text-foreground shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[var(--moss-deep)]">
                <Leaf className="w-3.5 h-3.5" /> Karbon ayak izi
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={targetCurrency}
                  onChange={(event) =>
                    setTargetCurrency(event.target.value as Exclude<DisplayCurrency, "TRY">)
                  }
                  className="rounded-md border border-primary/20 bg-background/70 px-2 py-1 text-[10px] font-semibold text-[var(--moss-deep)] outline-none"
                  aria-label="Hedef döviz"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <CalculationStatus active={carbonIsCalculating} label="Karbon hesaplanıyor" />
              </div>
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">
              {carbonIsCalculating ? (
                <LoadingText label="Yükleniyor" />
              ) : (
                <>
                  {co2.toFixed(0)}
                  <span className="text-xl text-foreground/55 ml-1">kg CO₂</span>
                </>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-background/55 px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.14em] text-foreground/55">
                  Karbon maliyeti TL
                </div>
                <div className="mt-1 font-mono text-sm font-semibold">
                  {carbonIsCalculating ? <LoadingText /> : fmtTRY(carbonCostTRY)}
                </div>
              </div>
              <div className="rounded-lg bg-background/55 px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.14em] text-foreground/55">
                  Hedef döviz
                </div>
                <div className="mt-1 font-mono text-sm font-semibold">
                  {carbonIsCalculating ? (
                    <LoadingText />
                  ) : carbonCostTarget !== null ? (
                    fmtCurrency(carbonCostTarget, targetCurrency, 2)
                  ) : (
                    "Kur bekleniyor"
                  )}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
              {carbonIsCalculating
                ? "Karbon salımı, mesafe ve maliyet bilgisi hesaplanıyor..."
                : `${quantityTon} ton × ${km.toFixed(0)} km × ${
                    carbonChain.data?.emissionFactor.label ?? VEHICLE_LABELS[calculationVehicle]
                  } emisyon faktörü · ${buyerLoc.label} konumundan hesaplandı.`}
            </p>
            <div className="mt-3 rounded-lg bg-background/55 px-3 py-2 text-xs text-foreground/70">
              {carbonIsCalculating ? (
                "Yükleniyor..."
              ) : carbonChain.data ? (
                <>
                  Zincir: {carbonChain.data.chain.join(" → ")} · Kaynak:{" "}
                  {carbonChain.data.sources.distance} · {carbonChain.data.emissionFactor.factor} kg
                  CO₂/ton-km
                </>
              ) : carbonChain.loading ? (
                "Canlı karbon zinciri hesaplanıyor..."
              ) : (
                `Tahmini değer (${carbonChain.error ?? "canlı zincir yok"})`
              )}
            </div>
            {carbonChain.data?.warnings.length ? (
              <div className="mt-3 rounded-lg bg-[var(--warning)]/20 px-3 py-2 text-xs text-foreground/75">
                {carbonChain.data.warnings.join(" ")}
              </div>
            ) : null}
            <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-background/55 text-sm">
              <TreePine className="w-4 h-4 text-[var(--moss-deep)]" />
              <span>
                {carbonIsCalculating ? (
                  "Yükleniyor..."
                ) : (
                  <>
                    <strong>{trees}</strong> ağacın yıllık CO₂ emilimine eşdeğer
                  </>
                )}
              </span>
            </div>
            <Link
              to="/methodology"
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--moss-deep)] hover:text-foreground"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Hesaplama yöntemini ve emisyon katsayılarını incele
            </Link>
          </div>

          {/* Offer button / form */}
          {!user ? (
            <Link
              to="/auth"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              <Truck className="w-4 h-4" />{" "}
              {isBuy ? "Alım talebi için giriş yap" : "Teklif vermek için giriş yap"}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setContactOpen((current) => !current)}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {isBuy ? (
                <>
                  <ShoppingCart className="w-4 h-4" /> Alım Talebine Katıl
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" /> Teklif Ver / İletişime Geç
                </>
              )}
            </button>
          )}

          {contactOpen ? (
            <form
              className="rounded-lg border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
              onSubmit={handleContactSubmit}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {isBuy ? "Tedarikçi başvurusu" : "Ön teklif talebi"}
              </div>
              <div className="mt-4 grid gap-3">
                <input
                  required
                  value={buyerName}
                  onChange={(event) => setBuyerName(event.target.value)}
                  placeholder="Ad Soyad"
                  className="contact-input"
                />
                <input
                  required
                  type="email"
                  value={buyerEmail}
                  onChange={(event) => setBuyerEmail(event.target.value)}
                  placeholder="E-posta"
                  className="contact-input"
                />
                <input
                  value={buyerPhone}
                  onChange={(event) => setBuyerPhone(event.target.value)}
                  placeholder="Telefon"
                  className="contact-input"
                />
                <div className="rounded-md bg-primary/10 px-3 py-2 text-xs text-[var(--moss-deep)]">
                  Gönderilecek hesap: {quantityTon} ton · {fmtTRY(offerUnitPriceTRY)}/ton ·{" "}
                  {fmtTRY(tradeEstimate.totalCostTRY)} toplam · {co2.toFixed(0)} kg CO₂
                </div>

                {buyerChoosesTransport ? (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <div className="text-xs font-semibold text-foreground mb-1">Taşıma hesabı</div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Araç tipi yukarıdaki fiyat hesabındaki seçimle aynıdır.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-md bg-[var(--moss)]/10 px-3 py-2 text-xs text-[var(--moss-deep)] font-semibold">
                        <Leaf className="w-3.5 h-3.5 shrink-0" />
                        {co2.toFixed(0)} kg CO₂
                      </div>
                      <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs font-semibold">
                        <Truck className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                        {fmtTRY(tradeEstimate.transportCostTRY)} taşıma
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-muted-foreground">
                      {km.toFixed(0)} km · {buyerLoc.label} konumundan
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">
                    Taşıma:{" "}
                    <span className="font-semibold text-foreground">
                      {VEHICLE_LABELS[calculationVehicle]}
                    </span>{" "}
                    — satıcı tarafından sağlanacak · {km.toFixed(0)} km ·{" "}
                    <span className="text-foreground font-semibold">
                      {fmtTRY(tradeEstimate.transportCostTRY)}
                    </span>{" "}
                    tahmini taşıma
                  </div>
                )}

                <textarea
                  required
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="contact-input resize-none"
                />
              </div>
              <button
                disabled={contactBusy}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {contactBusy ? "Kaydediliyor" : "Talebi Kaydet"}
              </button>
              {contactStatus ? (
                <div className="mt-3 rounded-md bg-primary/10 px-3 py-2 text-sm text-[var(--moss-deep)]">
                  {contactStatus}
                </div>
              ) : null}
              <div className="mt-3 text-xs text-muted-foreground">
                Satıcı iletişimi: {listing.contactEmail ?? "demo@tortu.app"}
                {listing.contactPhone ? ` · ${listing.contactPhone}` : ""}
              </div>
            </form>
          ) : null}
        </aside>
      </div>
      <style>{`.contact-input{width:100%;border-radius:0.5rem;border:1px solid var(--border);background:var(--background);padding:0.7rem 0.85rem;font-size:0.9rem;outline:none}.contact-input:focus{box-shadow:0 0 0 3px color-mix(in oklab,var(--ring) 28%,transparent);border-color:var(--ring)}`}</style>
    </div>
  );
}

function CalculationStatus({ active, label }: { active: boolean; label: string }) {
  if (!active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--moss-deep)]">
        Güncel
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--moss-deep)]">
      <LoaderCircle className="h-3 w-3 animate-spin" />
      {label}
    </span>
  );
}

function LoadingText({ label = "Yükleniyor..." }: { label?: string }) {
  return <span className="inline-flex min-w-20 text-muted-foreground">{label}</span>;
}
