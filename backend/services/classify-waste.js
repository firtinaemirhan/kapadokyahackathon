import { fetchWithTimeout } from "./network.js";

const CATEGORY_LABELS = [
  "seramik atığı",
  "gıda işleme yan ürünü",
  "tekstil firesi",
  "ahşap talaşı",
  "metal hurdası",
  "plastik atığı",
  "inşaat molozu",
  "tarım atığı",
  "üzüm cibresi",
  "perlit/pomza",
  "peyniraltı suyu",
  "zeytin pirinası",
];

const KEYWORD_MAP = [
  [["seramik", "şamot", "karo", "çömlek", "kil"], "ceramic"],
  [["üzüm", "cibre", "şarap", "bağ"], "grape-pomace"],
  [["halı", "tekstil", "iplik", "kumaş", "pamuk"], "textile"],
  [["ahşap", "talaş", "palet", "kereste"], "wood"],
  [["metal", "hurda", "demir", "bakır", "kablo"], "metal"],
  [["perlit", "pomza", "tüf", "volkanik"], "volcanic-tuff"],
  [["kabak", "çekirdek", "biyokütle"], "pumpkin-shell"],
];

const LABEL_TO_SLUG = {
  "seramik atığı": "ceramic",
  "gıda işleme yan ürünü": "pumpkin-shell",
  "tekstil firesi": "textile",
  "ahşap talaşı": "wood",
  "metal hurdası": "metal",
  "plastik atığı": "pumpkin-shell",
  "inşaat molozu": "volcanic-tuff",
  "tarım atığı": "pumpkin-shell",
  "üzüm cibresi": "grape-pomace",
  "perlit/pomza": "volcanic-tuff",
  "peyniraltı suyu": "pumpkin-shell",
  "zeytin pirinası": "pumpkin-shell",
};

export function fallbackClassify(text) {
  const normalized = String(text ?? "").toLocaleLowerCase("tr-TR");
  const hit = KEYWORD_MAP.find(([words]) => words.some((word) => normalized.includes(word)));
  const primary = hit?.[1] ?? "pumpkin-shell";
  const secondary = ["ceramic", "grape-pomace", "volcanic-tuff"]
    .filter((slug) => slug !== primary)
    .slice(0, 2)
    .map((slug, index) => ({ slug, score: 0.54 - index * 0.09 }));

  return [{ slug: primary, score: 0.82 }, ...secondary];
}

export async function classifyWaste(text) {
  const input = String(text ?? "").trim();
  if (input.length < 4) {
    throw new Error("Sınıflandırma için en az 4 karakter açıklama gerekli.");
  }

  if (!process.env.HF_API_KEY) {
    return { suggestions: fallbackClassify(input), source: "keyword-fallback" };
  }

  try {
    const response = await fetchWithTimeout(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: input,
          parameters: { candidate_labels: CATEGORY_LABELS },
        }),
      },
      12_000,
    );

    if (!response.ok) {
      throw new Error(`HF ${response.status}`);
    }

    const data = await response.json();
    const suggestions = (data?.labels ?? []).slice(0, 3).map((label, index) => ({
      slug: LABEL_TO_SLUG[label] ?? "pumpkin-shell",
      score: Number(data?.scores?.[index] ?? 0),
    }));

    return {
      suggestions: suggestions.length ? suggestions : fallbackClassify(input),
      source: suggestions.length ? "huggingface" : "keyword-fallback",
    };
  } catch {
    return { suggestions: fallbackClassify(input), source: "keyword-fallback" };
  }
}
