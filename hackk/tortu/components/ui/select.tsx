import * as React from "react"; import { cn } from "@/lib/utils";
export const Select=({className,...props}:React.SelectHTMLAttributes<HTMLSelectElement>)=><select className={cn("h-10 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700",className)} {...props}/>;
