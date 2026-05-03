# Tortu context snapshot

Task statement: Build the Tortu Cave2Cloud circular economy marketplace MVP from the supplied PRD in /Users/emirhanfirtina/Desktop/hackk/tortu.
Desired outcome: A Next.js 14 TypeScript app with Supabase-ready schema, server-side external API integrations, bilingual UI, listing flow, carbon bonus chain, PDF route, admin/dashboard pages, README, and passing build.
Known facts/evidence: Workspace is essentially empty; no existing app scaffold. PRD fixes stack and feature set. No real Supabase/API keys are present in the prompt/runtime.
Constraints: Use pnpm, Next 14 App Router, Tailwind/shadcn-style UI, Supabase-ready integration, no client-side secret leakage, no hardcoded distance/currency as primary source. Keep demo resilient with official TCMB XML fallback and Haversine fallback if API keys missing.
Unknowns/open questions: Real Supabase project and API keys must be supplied by user for full live auth/storage behavior and Vercel deployment.
Likely codebase touchpoints: tortu/app, tortu/components, tortu/lib, tortu/messages, tortu/supabase, tortu/README.md.
