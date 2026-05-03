import { randomUUID } from "node:crypto";
import { getSupabaseClient, supabaseSource } from "./supabase.js";

const memoryContactRequests = [];

const SCHEMA_ERROR_RE =
  /schema cache|could not find the table|relation .* does not exist|column .* does not exist/i;

function isSchemaError(error) {
  return SCHEMA_ERROR_RE.test(error?.message ?? "");
}

function supabaseError(action, error) {
  const schemaHint = isSchemaError(error)
    ? " Yeni tablolar için backend/supabase/schema.sql dosyasını Supabase SQL Editor'da çalıştırın."
    : "";
  return new Error(`Supabase ${action} başarısız: ${error.message}.${schemaHint}`);
}

function normalizeRow(row) {
  const optionalRowNumber = (snakeKey, camelKey) => {
    const value = row[snakeKey] ?? row[camelKey];
    return value === undefined || value === null ? undefined : Number(value);
  };

  return {
    id: row.id,
    listingId: row.listing_id ?? row.listingId,
    listingTitle: row.listing_title ?? row.listingTitle,
    seller: row.seller,
    buyerName: row.buyer_name ?? row.buyerName,
    buyerEmail: row.buyer_email ?? row.buyerEmail,
    buyerPhone: row.buyer_phone ?? row.buyerPhone ?? undefined,
    quantityTon: Number(row.quantity_ton ?? row.quantityTon),
    note: row.note,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    buyerLocationLabel: row.buyer_location_label ?? row.buyerLocationLabel ?? undefined,
    distanceKm: optionalRowNumber("distance_km", "distanceKm"),
    co2Kg: optionalRowNumber("co2_kg", "co2Kg"),
    offerUnitPriceTRY: optionalRowNumber("offer_unit_price_try", "offerUnitPriceTRY"),
    materialTotalTRY: optionalRowNumber("material_total_try", "materialTotalTRY"),
    transportCostTRY: optionalRowNumber("transport_cost_try", "transportCostTRY"),
    totalCostTRY: optionalRowNumber("total_cost_try", "totalCostTRY"),
    vehicle: row.vehicle ?? undefined,
  };
}

function optionalNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function normalizeInput(input) {
  const listingId = String(input?.listingId ?? input?.listing_id ?? "").trim();
  const listingTitle = String(input?.listingTitle ?? input?.listing_title ?? "").trim();
  const seller = String(input?.seller ?? "").trim();
  const buyerName = String(input?.buyerName ?? input?.buyer_name ?? "").trim();
  const buyerEmail = String(input?.buyerEmail ?? input?.buyer_email ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR");
  const buyerPhone = String(input?.buyerPhone ?? input?.buyer_phone ?? "").trim();
  const quantityTon = Number(input?.quantityTon ?? input?.quantity_ton);
  const note = String(input?.note ?? "").trim();
  const buyerLocationLabel = String(
    input?.buyerLocationLabel ?? input?.buyer_location_label ?? "",
  ).trim();
  const vehicle = String(input?.vehicle ?? "").trim();

  if (listingId.length < 2) throw new Error("İlan id gerekli.");
  if (listingTitle.length < 3) throw new Error("İlan başlığı gerekli.");
  if (seller.length < 2) throw new Error("Satıcı bilgisi gerekli.");
  if (buyerName.length < 2) throw new Error("Alıcı adı en az 2 karakter olmalı.");
  if (!buyerEmail.includes("@")) throw new Error("Geçerli alıcı e-postası gerekli.");
  if (!Number.isFinite(quantityTon) || quantityTon <= 0)
    throw new Error("Talep miktarı pozitif olmalı.");
  if (note.length < 8) throw new Error("Talep notu en az 8 karakter olmalı.");

  return {
    listingId,
    listingTitle,
    seller,
    buyerName,
    buyerEmail,
    buyerPhone: buyerPhone || null,
    quantityTon,
    note,
    buyerLocationLabel: buyerLocationLabel || null,
    distanceKm: optionalNumber(input?.distanceKm ?? input?.distance_km),
    co2Kg: optionalNumber(input?.co2Kg ?? input?.co2_kg),
    offerUnitPriceTRY: optionalNumber(input?.offerUnitPriceTRY ?? input?.offer_unit_price_try),
    materialTotalTRY: optionalNumber(input?.materialTotalTRY ?? input?.material_total_try),
    transportCostTRY: optionalNumber(input?.transportCostTRY ?? input?.transport_cost_try),
    totalCostTRY: optionalNumber(input?.totalCostTRY ?? input?.total_cost_try),
    vehicle: vehicle || null,
  };
}

export async function listContactRequestsByEmail(email) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const results = memoryContactRequests.filter(
      (r) => r.buyerEmail?.toLowerCase() === email.toLowerCase(),
    );
    return {
      requests: results,
      source: supabaseSource(),
      warning: "Supabase env bulunamadı; memory fallback kullanılıyor.",
    };
  }

  const { data, error } = await supabase
    .from("contact_requests")
    .select(
      "id, listing_id, listing_title, seller, buyer_name, buyer_email, buyer_phone, quantity_ton, note, created_at, buyer_location_label, distance_km, co2_kg, offer_unit_price_try, material_total_try, transport_cost_try, total_cost_try, vehicle",
    )
    .ilike("buyer_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    if (isSchemaError(error)) {
      return {
        requests: [],
        source: "memory-fallback",
        warning: "Supabase contact_requests şeması güncel değil; schema.sql'i çalıştırın.",
      };
    }
    throw supabaseError("teklif listesi", error);
  }

  return {
    requests: (data ?? []).map(normalizeRow),
    source: "supabase",
    warning: null,
  };
}

export async function createContactRequest(input) {
  const normalized = normalizeInput(input);
  const supabase = getSupabaseClient();

  if (!supabase) {
    const request = {
      id: `req-${randomUUID()}`,
      ...normalized,
      createdAt: new Date().toISOString(),
    };
    memoryContactRequests.unshift(request);
    return {
      request,
      source: supabaseSource(),
      warning: "Supabase env bulunamadı; teklif talebi server restart sonrası silinebilir.",
    };
  }

  const { data, error } = await supabase
    .from("contact_requests")
    .insert({
      listing_id: normalized.listingId,
      listing_title: normalized.listingTitle,
      seller: normalized.seller,
      buyer_name: normalized.buyerName,
      buyer_email: normalized.buyerEmail,
      buyer_phone: normalized.buyerPhone,
      quantity_ton: normalized.quantityTon,
      note: normalized.note,
      buyer_location_label: normalized.buyerLocationLabel,
      distance_km: normalized.distanceKm,
      co2_kg: normalized.co2Kg,
      offer_unit_price_try: normalized.offerUnitPriceTRY,
      material_total_try: normalized.materialTotalTRY,
      transport_cost_try: normalized.transportCostTRY,
      total_cost_try: normalized.totalCostTRY,
      vehicle: normalized.vehicle,
    })
    .select(
      "id, listing_id, listing_title, seller, buyer_name, buyer_email, buyer_phone, quantity_ton, note, created_at, buyer_location_label, distance_km, co2_kg, offer_unit_price_try, material_total_try, transport_cost_try, total_cost_try, vehicle",
    )
    .single();

  if (error) {
    if (isSchemaError(error)) {
      const request = {
        id: `req-${randomUUID()}`,
        ...normalized,
        createdAt: new Date().toISOString(),
      };
      memoryContactRequests.unshift(request);
      return {
        request,
        source: "memory-fallback",
        warning:
          "Supabase contact_requests şeması güncel değil; teklif memory'ye kaydedildi. schema.sql'i Supabase SQL Editor'da çalıştırın.",
      };
    }
    throw supabaseError("teklif talebi kaydı", error);
  }

  return {
    request: normalizeRow(data),
    source: "supabase",
    warning: null,
  };
}

export function clearContactRequestMemoryForTests() {
  memoryContactRequests.splice(0, memoryContactRequests.length);
}
