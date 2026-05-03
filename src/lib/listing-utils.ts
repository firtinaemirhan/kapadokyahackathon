import type { WasteCategory } from "./sample-listings";

export function imageForCategory(category: WasteCategory) {
  if (category === "grape-pomace" || category === "food-byproduct") return "pomace";
  if (category === "volcanic-tuff" || category === "perlite-pumice") return "tuff";
  if (category === "textile") return "textile";
  if (category === "pumpkin-shell" || category === "agricultural") return "pumpkin";
  if (category === "wood") return "wood";
  if (category === "metal") return "metal";
  return "ceramic";
}
