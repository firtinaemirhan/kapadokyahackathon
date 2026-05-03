import { NextResponse } from "next/server"; import { getRatesWithCache } from "@/lib/api/tcmb";
export async function GET(){ try{return NextResponse.json(await getRatesWithCache())}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"exchange rate failed"},{status:500})} }
