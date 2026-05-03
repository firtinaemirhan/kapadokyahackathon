"use client"; import dynamic from "next/dynamic"; import type { Listing } from "@/lib/types";
const LeafletMap=dynamic(()=>import("@/components/map/LeafletMap"),{ssr:false,loading:()=> <div className="grid h-[420px] place-items-center rounded-lg bg-stone-100 text-stone-600">Harita yükleniyor</div>});
export function ListingMap({listings}:{listings:Listing[]}){ return <LeafletMap listings={listings}/>; }
