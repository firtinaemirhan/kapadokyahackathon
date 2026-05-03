import { randomUUID } from "node:crypto";
import { getSupabaseClient } from "./supabase.js";

const memoryProfiles = new Map();

function normalizeProfile(row) {
  return {
    id: row.id,
    fullName: row.full_name ?? row.fullName,
    companyName: row.company_name ?? row.companyName,
    email: row.email,
    role: row.role ?? "both",
    city: row.city ?? "Nevşehir",
    phone: row.phone ?? "",
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    source: row.source ?? "supabase",
  };
}

function normalizeUserInput(input, partial = false) {
  const email = String(input?.email ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR");
  const fullName = String(input?.fullName ?? input?.full_name ?? "").trim();
  const companyName = String(input?.companyName ?? input?.company_name ?? "").trim();
  const role = input?.role ?? "both";
  const city = String(input?.city ?? "Nevşehir").trim();
  const phone = String(input?.phone ?? "").trim();

  if (!partial && !email.includes("@")) throw new Error("Geçerli e-posta gerekli.");
  if (!partial && fullName.length < 2) throw new Error("Ad soyad en az 2 karakter olmalı.");
  if (!partial && companyName.length < 2) throw new Error("Firma adı en az 2 karakter olmalı.");
  if (!["producer", "buyer", "both"].includes(role)) throw new Error("Rol geçersiz.");

  return { email, fullName, companyName, role, city, phone };
}

export async function signupUser(input) {
  const normalized = normalizeUserInput(input);
  const supabase = getSupabaseClient();

  if (!supabase) {
    const existing = memoryProfiles.get(normalized.email);
    const profile = {
      id: existing?.id ?? `local-${randomUUID()}`,
      ...normalized,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      source: "server-memory-fallback",
    };
    memoryProfiles.set(normalized.email, profile);
    return {
      user: profile,
      source: "server-memory-fallback",
      warning: "Supabase env bulunamadı; kullanıcı server memory fallback ile tutuluyor.",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        email: normalized.email,
        full_name: normalized.fullName,
        company_name: normalized.companyName,
        role: normalized.role,
        city: normalized.city,
        phone: normalized.phone,
      },
      { onConflict: "email" },
    )
    .select("id, full_name, company_name, email, role, city, phone, created_at")
    .single();

  if (error) throw new Error(`Supabase kullanıcı kaydı başarısız: ${error.message}`);

  return { user: normalizeProfile(data), source: "supabase", warning: null };
}

export async function loginUser(input) {
  const email = String(input?.email ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR");
  if (!email.includes("@")) throw new Error("Geçerli e-posta gerekli.");
  const supabase = getSupabaseClient();

  if (!supabase) {
    const user =
      memoryProfiles.get(email) ??
      normalizeProfile({
        id: `local-${randomUUID()}`,
        fullName: email.split("@")[0] || "Demo Kullanıcı",
        companyName: "Demo Firma",
        email,
        role: "both",
        city: "Nevşehir",
        source: "server-memory-fallback",
      });
    memoryProfiles.set(email, user);
    return {
      user,
      source: "server-memory-fallback",
      warning: "Supabase env bulunamadı; demo kullanıcı server memory fallback ile açıldı.",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, email, role, city, phone, created_at")
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error(`Supabase kullanıcı sorgusu başarısız: ${error.message}`);
  if (!data) throw new Error("Bu e-posta ile kayıtlı kullanıcı bulunamadı.");

  return { user: normalizeProfile(data), source: "supabase", warning: null };
}

export async function updateUser(id, input) {
  if (!id) throw new Error("Kullanıcı id gerekli.");
  const normalized = normalizeUserInput(input, true);
  const supabase = getSupabaseClient();

  if (!supabase) {
    const current = [...memoryProfiles.values()].find((profile) => profile.id === id);
    if (!current) throw new Error("Kullanıcı bulunamadı.");
    const updated = { ...current, ...normalized, email: current.email };
    memoryProfiles.set(updated.email, updated);
    return {
      user: updated,
      source: "server-memory-fallback",
      warning: "Supabase env bulunamadı; profil server memory fallback ile güncellendi.",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: normalized.fullName,
      company_name: normalized.companyName,
      role: normalized.role,
      city: normalized.city,
      phone: normalized.phone,
    })
    .eq("id", id)
    .select("id, full_name, company_name, email, role, city, phone, created_at")
    .single();

  if (error) throw new Error(`Supabase profil güncelleme başarısız: ${error.message}`);

  return { user: normalizeProfile(data), source: "supabase", warning: null };
}

export async function getUser(id) {
  if (!id) throw new Error("Kullanıcı id gerekli.");
  const supabase = getSupabaseClient();

  if (!supabase) {
    const user = [...memoryProfiles.values()].find((profile) => profile.id === id);
    if (!user) throw new Error("Kullanıcı bulunamadı.");
    return { user, source: "server-memory-fallback", warning: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, email, role, city, phone, created_at")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Supabase profil alınamadı: ${error.message}`);

  return { user: normalizeProfile(data), source: "supabase", warning: null };
}
