import { NextRequest, NextResponse } from "next/server"; import { reverseGeocode } from "@/lib/api/nominatim";
export async function POST(req:NextRequest){ try{const {lat,lng}=await req.json(); return NextResponse.json(await reverseGeocode(Number(lat),Number(lng)));}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"reverse geocode failed"},{status:500})} }
