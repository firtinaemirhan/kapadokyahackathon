import assert from "node:assert/strict";
import test, { afterEach, beforeEach } from "node:test";
import {
  clearListingMemoryForTests,
  createListing,
  deleteListing,
  getListing,
  listListings,
} from "../services/listings.js";
import {
  clearContactRequestMemoryForTests,
  createContactRequest,
} from "../services/contact-requests.js";

const originalSupabaseUrl = process.env.SUPABASE_URL;
const originalNextSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalSupabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const originalNextSupabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const originalSupabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function disableSupabase() {
  delete process.env.SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
}

beforeEach(() => {
  disableSupabase();
  clearListingMemoryForTests();
  clearContactRequestMemoryForTests();
});

afterEach(() => {
  clearListingMemoryForTests();
  clearContactRequestMemoryForTests();
  if (originalSupabaseUrl === undefined) {
    delete process.env.SUPABASE_URL;
  } else {
    process.env.SUPABASE_URL = originalSupabaseUrl;
  }
  if (originalNextSupabaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalNextSupabaseUrl;
  }
  if (originalSupabaseAnonKey === undefined) {
    delete process.env.SUPABASE_ANON_KEY;
  } else {
    process.env.SUPABASE_ANON_KEY = originalSupabaseAnonKey;
  }
  if (originalNextSupabasePublishableKey === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalNextSupabasePublishableKey;
  }
  if (originalSupabaseServiceRoleKey === undefined) {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  } else {
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseServiceRoleKey;
  }
});

test("ilanı backend servisinde oluşturur, listeler ve siler", async () => {
  const created = await createListing({
    title: "Kabak kabuğu biyokütle stoku",
    category: "pumpkin-shell",
    city: "Nevşehir",
    seller: "Gülşehir Koop.",
    tonnage: 12,
    pricePerTonTRY: 1500,
    lat: 38.7472,
    lng: 34.6253,
    description: "Pelet ve biyokömür için kuru kabuk stoku.",
    image: "pumpkin",
    vehicle: "truck",
    contactEmail: "satici@example.com",
    contactPhone: "555 000 00 00",
    createdBy: "user-1",
  });

  assert.equal(created.source, "server-memory-fallback");
  assert.equal(created.listing.isUserCreated, true);
  assert.equal(created.listing.seller, "Gülşehir Koop.");

  const listed = await listListings();
  assert.equal(listed.listings.length, 1);
  assert.equal(listed.listings[0].id, created.listing.id);

  const found = await getListing(created.listing.id);
  assert.equal(found.listing.title, "Kabak kabuğu biyokütle stoku");

  const deleted = await deleteListing(created.listing.id);
  assert.equal(deleted.deleted, true);
  assert.equal((await listListings()).listings.length, 0);
});

test("teklif talebini backend servisinde kaydeder", async () => {
  const result = await createContactRequest({
    listingId: "TRT-1001",
    listingTitle: "Sırlı seramik kırığı",
    seller: "Avanos Çini",
    buyerName: "Emirhan Fırtına",
    buyerEmail: "emirhan@example.com",
    buyerPhone: "555 111 22 33",
    quantityTon: 6,
    note: "Numune ve sevkiyat için ön teklif istiyorum.",
    buyerLocationLabel: "Kayseri",
    distanceKm: 72,
    co2Kg: 43.2,
    offerUnitPriceTRY: 1850,
    materialTotalTRY: 11100,
    transportCostTRY: 518.4,
    totalCostTRY: 11618.4,
    vehicle: "truck",
  });

  assert.equal(result.source, "server-memory-fallback");
  assert.equal(result.request.listingId, "TRT-1001");
  assert.equal(result.request.quantityTon, 6);
  assert.equal(result.request.buyerLocationLabel, "Kayseri");
  assert.equal(result.request.totalCostTRY, 11618.4);
});
