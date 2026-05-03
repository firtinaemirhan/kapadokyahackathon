import { randomUUID } from "node:crypto";
import { getSupabaseClient, supabaseSource } from "./supabase.js";

const memoryListings = [];

const VALID_CATEGORIES = new Set([
  "ceramic",
  "food-byproduct",
  "textile",
  "grape-pomace",
  "volcanic-tuff",
  "pumpkin-shell",
  "wood",
  "metal",
  "plastic",
  "construction-rubble",
  "agricultural",
  "perlite-pumice",
  "cheese-whey",
  "olive-pomace",
]);

const VALID_VEHICLES = new Set(["truck", "van", "rail", "sea", "buyer"]);
const VALID_LISTING_TYPES = new Set(["sell", "buy"]);

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

function finiteNumber(value, fallback = null) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeRow(row) {
  return {
    id: row.id,
    listingType: row.listing_type ?? row.listingType ?? "sell",
    title: row.title,
    category: row.category,
    city: row.city,
    district: row.district ?? undefined,
    seller: row.seller,
    tonnage: Number(row.tonnage),
    pricePerTonTRY: Number(row.price_per_ton_try ?? row.pricePerTonTRY),
    lat: Number(row.lat),
    lng: Number(row.lng),
    description: row.description,
    image: row.image,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    vehicle: row.vehicle,
    isUserCreated: Boolean(row.is_user_created ?? row.isUserCreated ?? true),
    contactEmail: row.contact_email ?? row.contactEmail ?? undefined,
    contactPhone: row.contact_phone ?? row.contactPhone ?? undefined,
    createdBy: row.created_by ?? row.createdBy ?? null,
  };
}

function normalizeInput(input) {
  const title = String(input?.title ?? "").trim();
  const category = String(input?.category ?? "").trim();
  const city = String(input?.city ?? "").trim();
  const district = String(input?.district ?? "").trim();
  const seller = String(input?.seller ?? "").trim();
  const description = String(input?.description ?? "").trim();
  const image = String(input?.image ?? "ceramic").trim();
  const vehicle = String(input?.vehicle ?? "truck").trim();
  const contactEmail = String(input?.contactEmail ?? input?.contact_email ?? "").trim();
  const contactPhone = String(input?.contactPhone ?? input?.contact_phone ?? "").trim();
  const createdBy = input?.createdBy ?? input?.created_by ?? null;
  const listingType = String(input?.listingType ?? input?.listing_type ?? "sell").trim();
  const tonnage = finiteNumber(input?.tonnage);
  const pricePerTonTRY = finiteNumber(input?.pricePerTonTRY ?? input?.price_per_ton_try);
  const lat = finiteNumber(input?.lat);
  const lng = finiteNumber(input?.lng);

  if (title.length < 3) throw new Error("İlan başlığı en az 3 karakter olmalı.");
  if (!VALID_CATEGORIES.has(category)) throw new Error("Desteklenmeyen materyal kategorisi.");
  if (city.length < 2) throw new Error("Şehir bilgisi gerekli.");
  if (seller.length < 2) throw new Error("Satıcı bilgisi gerekli.");
  if (!Number.isFinite(tonnage) || tonnage <= 0) throw new Error("Miktar pozitif olmalı.");
  if (!Number.isFinite(pricePerTonTRY) || pricePerTonTRY < 0) {
    throw new Error("Birim fiyat 0 veya daha büyük olmalı.");
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Geçerli enlem gerekli.");
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error("Geçerli boylam gerekli.");
  if (description.length < 8) throw new Error("Açıklama en az 8 karakter olmalı.");
  if (!VALID_VEHICLES.has(vehicle)) throw new Error("Desteklenmeyen taşıma tipi.");
  if (!VALID_LISTING_TYPES.has(listingType)) throw new Error("Desteklenmeyen ilan tipi.");
  if (contactEmail && !contactEmail.includes("@"))
    throw new Error("Geçerli iletişim e-postası gerekli.");

  return {
    listingType,
    title,
    category,
    city,
    district: district || null,
    seller,
    tonnage,
    pricePerTonTRY,
    lat,
    lng,
    description,
    image,
    vehicle,
    contactEmail: contactEmail || null,
    contactPhone: contactPhone || null,
    createdBy,
  };
}

export async function listListings() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      listings: [...memoryListings],
      source: supabaseSource(),
      warning: "Supabase env bulunamadı; ilanlar server memory fallback ile tutuluyor.",
    };
  }

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, listing_type, title, category, city, district, seller, tonnage, price_per_ton_try, lat, lng, description, image, created_at, vehicle, is_user_created, contact_email, contact_phone, created_by",
    )
    .order("created_at", { ascending: false });

  if (error) {
    if (isSchemaError(error)) {
      return {
        listings: [...memoryListings],
        source: "memory-fallback",
        warning:
          "Supabase tablosu henüz oluşturulmamış; memory fallback aktif. schema.sql'i Supabase SQL Editor'da çalıştırın.",
      };
    }
    throw supabaseError("ilan listesi", error);
  }

  return {
    listings: (data ?? []).map(normalizeRow),
    source: "supabase",
    warning: null,
  };
}

export async function getListing(id) {
  if (!id) throw new Error("İlan id gerekli.");
  const supabase = getSupabaseClient();

  if (!supabase) {
    const listing = memoryListings.find((item) => item.id === id);
    if (!listing) throw new Error("İlan bulunamadı.");
    return { listing, source: supabaseSource(), warning: null };
  }

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, listing_type, title, category, city, district, seller, tonnage, price_per_ton_try, lat, lng, description, image, created_at, vehicle, is_user_created, contact_email, contact_phone, created_by",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isSchemaError(error)) {
      const listing = memoryListings.find((item) => item.id === id);
      if (!listing) throw new Error("İlan bulunamadı.");
      return {
        listing,
        source: "memory-fallback",
        warning: "Supabase tablosu henüz oluşturulmamış; memory fallback aktif.",
      };
    }
    throw supabaseError("ilan sorgusu", error);
  }
  if (!data) throw new Error("İlan bulunamadı.");

  return { listing: normalizeRow(data), source: "supabase", warning: null };
}

export async function createListing(input) {
  const normalized = normalizeInput(input);
  const supabase = getSupabaseClient();

  if (!supabase) {
    const listing = {
      id: `srv-${randomUUID()}`,
      ...normalized,
      createdAt: new Date().toISOString(),
      isUserCreated: true,
    };
    memoryListings.unshift(listing);
    return {
      listing,
      source: supabaseSource(),
      warning: "Supabase env bulunamadı; ilan server restart sonrası silinebilir.",
    };
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      listing_type: normalized.listingType,
      title: normalized.title,
      category: normalized.category,
      city: normalized.city,
      district: normalized.district,
      seller: normalized.seller,
      tonnage: normalized.tonnage,
      price_per_ton_try: normalized.pricePerTonTRY,
      lat: normalized.lat,
      lng: normalized.lng,
      description: normalized.description,
      image: normalized.image,
      vehicle: normalized.vehicle,
      is_user_created: true,
      contact_email: normalized.contactEmail,
      contact_phone: normalized.contactPhone,
      created_by: normalized.createdBy,
    })
    .select(
      "id, listing_type, title, category, city, district, seller, tonnage, price_per_ton_try, lat, lng, description, image, created_at, vehicle, is_user_created, contact_email, contact_phone, created_by",
    )
    .single();

  if (error) {
    if (isSchemaError(error)) {
      const listing = {
        id: `srv-${randomUUID()}`,
        ...normalized,
        createdAt: new Date().toISOString(),
        isUserCreated: true,
      };
      memoryListings.unshift(listing);
      return {
        listing,
        source: "memory-fallback",
        warning:
          "Supabase tablosu henüz oluşturulmamış; ilan memory'ye kaydedildi. schema.sql'i Supabase SQL Editor'da çalıştırın.",
      };
    }
    throw supabaseError("ilan kaydı", error);
  }

  return {
    listing: normalizeRow(data),
    source: "supabase",
    warning: null,
  };
}

export async function deleteListing(id) {
  if (!id) throw new Error("İlan id gerekli.");
  const supabase = getSupabaseClient();

  if (!supabase) {
    const before = memoryListings.length;
    const next = memoryListings.filter((item) => item.id !== id);
    memoryListings.splice(0, memoryListings.length, ...next);
    if (before === memoryListings.length) throw new Error("İlan bulunamadı.");
    return {
      deleted: true,
      source: supabaseSource(),
      warning: "Supabase env bulunamadı; silme işlemi server memory fallback üzerinde yapıldı.",
    };
  }

  const { data, error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("is_user_created", true)
    .select("id")
    .maybeSingle();

  if (error) {
    if (isSchemaError(error)) {
      const before = memoryListings.length;
      const next = memoryListings.filter((item) => item.id !== id);
      memoryListings.splice(0, memoryListings.length, ...next);
      if (before === memoryListings.length) throw new Error("İlan bulunamadı.");
      return {
        deleted: true,
        source: "memory-fallback",
        warning: "Supabase tablosu henüz oluşturulmamış; silme memory fallback üzerinde yapıldı.",
      };
    }
    throw supabaseError("ilan silme", error);
  }
  if (!data) throw new Error("İlan bulunamadı veya silinemez.");

  return { deleted: true, source: "supabase", warning: null };
}

export function clearListingMemoryForTests() {
  memoryListings.splice(0, memoryListings.length);
}
