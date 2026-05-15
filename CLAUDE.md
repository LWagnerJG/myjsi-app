# MyJSI — Project Context for Claude Code

## What this is
MyJSI is a mobile-first PWA for JSI Furniture's dealers and internal sales reps.
Phased against a 45-feature scorecard. The Phase 1 / Phase 2 boundary is the
dealer-ready tollgate — nothing ships to external dealers until that bar is met.

## Actual stack (differs from planning docs)
- Runtime: Vite 5 + React 18 SPA — NOT Next.js App Router.
- Styling: Tailwind CSS 3, PostCSS. Config in tailwind.config.cjs.
- Animation: framer-motion 12. Tokens in src/design-system/motion.js.
- Charts: recharts. Drag: dnd-kit. Icons: lucide-react.
- Deploy: Vercel (vercel.json at root). Build output: dist/.
- Tests: vitest + @testing-library/react. Run: npm test -- --run
- Supabase: not yet wired. All data is static in per-screen data.js files.
- External calls: Power Automate webhooks (Azure Logic Apps) only, via src/utils/secureWebhook.js.

## Source layout
```
src/
  App.jsx                    — root; handleNavigate(screen, params) drives all routing
  config/screenMap.js        — maps screen name strings to lazy-loaded components
  constants/                 — shared constants (verticals, apps, discounts, locations)
  components/common/         — GlassCard, Modal, AppScreenLayout, SearchInput, etc.
  components/navigation/     — AppHeader, ProfileMenu
  design-system/tokens.js    — JSI brand colors, typography (Neue Haas Grotesk)
  design-system/motion.js    — shared animation tokens
  data/                      — global static data (jsiSeries, cloudinary, themeData)
  hooks/                     — usePersistentState, usePrefersReducedMotion
  screens/{domain}/          — one folder per feature domain
    {domain}/data.js         — co-located static data (will migrate to Supabase)
    {domain}/index.js        — barrel export
  utils/                     — format, haptics, projectHelpers, secureWebhook, etc.
```

## Navigation pattern
App.jsx calls `handleNavigate(screenName, params)`. Params are stored as `screenParams`
and spread to every screen as props. Screens read `screenParams?.foo` to respond to
cross-screen navigation (e.g. vertical filter, company filter, pipeline stage).

## Elliott Bot — current state vs. intent
Elliott Bot is the AI infrastructure layer — one LLM with a clean tool-callable API
surface, ~26 functions. It is NOT multi-agent. The `elliott-bot-api-contract` skill
is the source of truth for what each function does, returns, and must not do.

Current reality: no live Elliott Bot API exists in this codebase. The chat overlay
(`src/screens/home/hooks/useHomeChat.js`) uses a local `generateReply()` keyword
matcher — no LLM, no network call. The RFP responder is a fully mocked UI with
hardcoded stages and data. These are placeholders for the real API.

## Design system
Brand colors and typography in `src/design-system/tokens.js`.
Primary: charcoal `#353535`. Earth-toned neutrals: stone, warmBeige, sageGrey.
Semantic: success `#4A7C59`, warning `#C4956A`, error `#B85C5C`, info `#5B7B8C`.
Font: Neue Haas Grotesk Display Pro.
Vertical colors canonical source: `src/constants/verticals.js`.

## Team
Luke (product + AI lead), Brian Taylor (dev lead), Nate Wagner (developer).
Doug Shapiro and Brian Gramelspacher are stakeholders.

## Output style
Concise, structured, direct. Numbered lists over prose. No bold text in prose.
One clarifying question at a time. Recommend, do not enumerate options.

## Working pattern
Plan Mode for anything non-trivial. One logical change per branch.
Commit and push to feature branch. Open PR via GitHub MCP. Update this file
when a recurring pattern is discovered.

## Hard rules
1. No multi-agent frameworks — ever.
2. No Filesystem MCP.
3. No n8n-as-code or workflow-orchestration tools.
4. RFP content must reference jsi-rfp-response and jsi-state-contracts skills.
5. Mobile-first: 44px minimum touch targets, 390px viewport tested first.
6. All future Supabase access via typed queries — no raw SQL in app code.
7. secureWebhook.js must be used for all Power Automate / external POST calls.

## MCP servers
GitHub: wired (session environment). Vercel: wired (list/get deployments).
Supabase: not yet wired — needs project ref + read-only key.
Playwright: wired (activate per task). Context7: wired (use context7 in prompt).
Sentry: deferred to dealer-ready tollgate.

## Skills
Anthropic: docx, pptx, pdf, xlsx, frontend-design.
Custom (build in order): elliott-bot-api-contract, jsi-brand,
myjsi-design-system, jsi-rfp-response, jsi-state-contracts,
jsi-product-data, myjsi-phasing.

## Before starting any non-trivial task, ask
1. Which phase of the 45-feature scorecard does this belong to?
2. Is this a feature, or a consumer of an Elliott Bot API function that doesn't exist yet?
3. What is the smallest version that proves the idea for one dealer?
