import { randomUUID } from "node:crypto";
import { getSupabaseClient, supabaseSource } from "./supabase.js";
import { SEED_PRODUCTS } from "./product-seeds.js";

const memoryProducts = [];

function normalizeRow(row) {
  return {
    id: row.id,
    productName: row.product_name ?? row.productName,
    byproducts: Array.isArray(row.byproducts) ? row.byproducts : [],
    isAgricultural: Boolean(row.is_agricultural ?? row.isAgricultural),
    createdBy: row.created_by ?? row.createdBy ?? null,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    source: row.source ?? "supabase",
  };
}

function normalizeInput(input) {
  const productName = String(input?.productName ?? input?.product_name ?? "").trim();
  const byproducts = Array.isArray(input?.byproducts)
    ? input.byproducts.map((item) => String(item).trim()).filter(Boolean)
    : String(input?.byproductsText ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  if (productName.length < 2) {
    throw new Error("Ürün adı en az 2 karakter olmalı.");
  }
  if (byproducts.length === 0) {
    throw new Error("En az bir oluşan atık / yan ürün maddesi girilmeli.");
  }

  return {
    productName,
    byproducts,
    createdBy: input?.createdBy ?? null,
  };
}

export async function listProducts() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      products: [...SEED_PRODUCTS, ...memoryProducts],
      source: supabaseSource(),
      warning: "Supabase env bulunamadı; ürünler server memory fallback ile tutuluyor.",
    };
  }

  const { data, error } = await supabase
    .from("product_types")
    .select("id, product_name, byproducts, is_agricultural, created_by, created_at")
    .eq("is_agricultural", true)
    .order("product_name", { ascending: true });

  if (error) {
    throw new Error(`Supabase ürün listesi alınamadı: ${error.message}`);
  }

  const customProducts = (data ?? []).map(normalizeRow);
  const seedNames = new Set(
    SEED_PRODUCTS.map((product) => product.productName.toLocaleLowerCase("tr-TR")),
  );
  const dedupedCustom = customProducts.filter(
    (product) => !seedNames.has(product.productName.toLocaleLowerCase("tr-TR")),
  );

  return {
    products: [...SEED_PRODUCTS, ...dedupedCustom],
    source: "supabase",
    warning: null,
  };
}

export async function createProduct(input) {
  const normalized = normalizeInput(input);
  const supabase = getSupabaseClient();

  if (!supabase) {
    const product = {
      id: `local-${randomUUID()}`,
      productName: normalized.productName,
      byproducts: normalized.byproducts,
      isAgricultural: true,
      createdBy: normalized.createdBy,
      createdAt: new Date().toISOString(),
      source: "server-memory-fallback",
    };
    memoryProducts.push(product);
    return {
      product,
      source: "server-memory-fallback",
      warning: "Supabase env bulunamadı; kayıt server restart sonrası silinebilir.",
    };
  }

  const { data, error } = await supabase
    .from("product_types")
    .insert({
      product_name: normalized.productName,
      byproducts: normalized.byproducts,
      is_agricultural: true,
      created_by: normalized.createdBy,
    })
    .select("id, product_name, byproducts, is_agricultural, created_by, created_at")
    .single();

  if (error) {
    throw new Error(`Supabase ürün kaydı başarısız: ${error.message}`);
  }

  return {
    product: normalizeRow(data),
    source: "supabase",
    warning: null,
  };
}
