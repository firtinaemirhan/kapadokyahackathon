export function formatTry(v:number){ return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(v); }
export function formatUsd(v:number){ return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(v); }
export function formatEur(v:number){ return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(v); }
