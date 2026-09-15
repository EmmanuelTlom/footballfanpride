# FootballFanPrime — Master Product Specification

Status: **Draft v1** — architecture/product definition stage. No implementation until this is reviewed and the MVP section is agreed.
Source context: `context.md` (original brainstorm) + follow-up design discussion.

---

## 1. Product Vision

A football fan engagement platform where the core product isn't football content — it's **status and competition built on football**. Users don't just consume football; they build a football identity (rank, IQ, streak, club allegiance) that they want to protect, grow, and show off.

One-sentence test for the whole product: *"What's happening in football today — and where do I stand?"*

Portfolio framing: [ShopBook] is a B2B SaaS product (people arrive because they have a business problem). FootballFanPrime is a consumer network product (people arrive because they want status, competition, and belonging). Different products, different growth mechanics — this spec treats FootballFanPrime as its own thing, not a feature bolted onto ShopBook.

---

## 2. Product Principles (non-negotiable filters)

Every proposed feature must pass this test before it's built:

> Does this increase **engagement, competition, identity/status, retention, virality, or monetization** — or does it add real **football value**? If it does none of these, it doesn't belong in this product.

Additional hard rules carried from the original brainstorm:

- **Never let AI invent facts.** Verified data → deterministic scoring/methodology → AI explains it in natural language. Never "AI decides the stat."
- **Never let personalization change official results.** Users can build personalized comparisons with custom weights; the official platform ranking/comparison always uses one published, versioned methodology.
- **It's allowed to not pick a winner.** "Too Close to Call" is a valid, trust-building outcome — better than manufacturing a winner every time.
- **Simple surface, sophisticated engine.** Primary navigation should stay to ~5 destinations no matter how much depth exists underneath.
- **Fast is a feature, not a nice-to-have.** Every interaction (tap → answer → next question, prediction submit, leaderboard update) must feel instant. This is a harder requirement than usual because the intended market (Nigeria, then wider Africa) skews toward variable network conditions — low-data mode and aggressive caching are launch requirements, not later optimizations.
- **Real-money betting is explicitly out of scope for the core product.** Points → rank → status → sponsored rewards, not stakes. A regulated real-money product, if ever pursued, is a separate business decision requiring its own licensing track.

---

## 3. Target Users & Market Sequencing

- **Primary persona**: young football-obsessed fan (late teens–30s), already argues about football on WhatsApp/Twitter, competitive by nature, price-sensitive but will pay for status.
- **Market sequencing**: Nigeria (v1) → Ghana / Kenya / South Africa → UK/African diaspora → wider global football audience.
- Design for mobile-first, Android-first, low/variable bandwidth from day one.

---

## 4. Core Psychological Loops

```
Play → Improve → Prove → Rank → Compete → Gain Status → Share → Return
```

Supporting loops:
- **Daily ritual loop**: today's mission (3 small tasks) → streak maintained → tomorrow's reason to open the app.
- **Proximity loop**: the app should constantly surface *how close* you are to the next milestone ("340 XP to Elite Fan II", "one win from Top 10"), not just static current state.
- **Social proof loop**: achievements and rank changes generate shareable moments (WhatsApp is the primary share surface for the initial market).

---

## 5. User Identity & Progression System

### 5.1 Four separate stats (deliberately not one score)

| Stat | Meaning | Prevents |
|---|---|---|
| XP / Level | How active the user is | — |
| Football IQ | How much football knowledge they've demonstrated | Confusing activity with knowledge |
| Battle Rating | Skill against other real users (Elo-style) | Grinding easy solo content to fake competitive skill |
| Rank | Current standing on any given leaderboard | — |

Practice-mode quizzes feed **Football IQ** only. Fan Battles (PvP) feed **Battle Rating**. This separation is what stops "10,000 easy answers = #1."

### 5.2 Two parallel status ladders

- **Global Star Tier**: `New Fan → Supporter → Dedicated Fan → Football Nerd → Elite Fan → Ultimate Fan`, each with I/II/III sub-levels so there's always a near milestone.
- **Club Star Tier**: a second status tied to the user's chosen club (e.g. "Arsenal Ultimate Fan"), leveled by club-specific quizzes, predictions, and battles. This is the more shareable, identity-driven status of the two.

### 5.3 Streaks & Star Shield

- Daily streak counter, visible everywhere.
- **Star Shield**: protects a streak/tier from breaking after one missed day. Free users get 1/week; premium users get more, or can purchase extra shields with earned currency. This converts "I already broke my streak, why bother" into "don't waste tomorrow's shield too."

### 5.4 Football Resume (public profile)

A shareable profile card: club, tier, Football IQ, Battle Rating, streak, national/club/global rank, battle record, achievements, specialties (e.g. "Premier League 97%, Man United 98%"). Designed to be screenshotted and shared — this is a primary organic growth mechanic, not an afterthought.

---

## 6. Home / TODAY

Single home surface answering "what's happening today, where do I stand":
- Today's matches relevant to the user's club/follows
- Today's mission (3 tasks: daily challenge, a prediction, a battle) with progress
- Streak status + shield state
- Proximity nudges (rank, tier, or streak-related)
- Primary nav stays at ~5 items: **Home · Play · Football · Rankings · Profile**

---

## 7. Football IQ & Quizzes

### 7.1 Practice Mode (self-quiz)
- Untimed or timed, by topic (club, league, competition, player, era).
- Feeds **Football IQ** and topic-mastery badges only — never Battle Rating.
- Adaptive weighting: tracks per-topic accuracy, skews future questions toward weak topics ("You're 97% on Man United, 61% on Serie A — 5 questions to fix that").
- **MVP question source: a curated static question bank**, not live LLM generation per question — cheaper, zero hallucination risk, predictable quality. AI can be used *offline* to help author the bank in bulk, with human review before it ships.

### 7.2 Daily Challenge
- One shared challenge per day for all users (same questions), contributes to XP + a daily leaderboard.

### 7.3 Fan Battles (PvP)
- 1v1 or small-group real-time quiz battles, Elo-style Battle Rating adjustment.
- Matchmaking targets similar Battle Rating ("we found someone around your level").

---

## 8. Predictions & Matchday

Before kickoff: winner, exact score, first goalscorer, goals over/under, corners/cards, starting XI builder.
During match: live "who scores next," live trivia, live leaderboard movement.
After match: points awarded, rank movement, friend leaderboard, match rating.

Matchday is the strongest recurring trigger in the product — this is the feature most tied to daily/weekly return behavior and should be prioritized in MVP.

---

## 9. Comparison Engine — "Football Intelligence Engine"

Treated as a first-class subsystem, not a quiz-adjacent function — it's the most differentiated part of the product and the thing most likely to generate organic sharing/argument.

### 9.1 Layered architecture
```
Data Layer        → what actually happened (verified stats, sourced, versioned)
Analytics Layer    → what the data indicates (normalized rates, categories)
Game/Scoring Layer → deterministic methodology: category winners, weights, overall result
Presentation Layer → AI-narrated explanation of an already-computed result
```

### 9.2 Methodology rules
- **Stat winner**: simple, single-metric comparison (e.g. total goals).
- **Category winner**: several related metrics rolled into one category (scoring, creation, efficiency, trophies, longevity, big-game record), each with a published weight.
- **Overall comparison**: category results combined into a final score, only after all categories are computed — never a single opaque number.
- **Minimum sample sizes** required for any rate-based category (no 3-game sample beating a 150-game sample on "efficiency").
- **Context boundaries**: never silently mix competitions, eras, or positions without the user explicitly selecting that comparison.
- **"Too Close to Call"** is a valid, expected output when the gap isn't meaningful under the methodology — not a failure state.
- **"Why?"** button on every result, showing the category-by-category breakdown and source data.
- **Official vs personalized**: the platform's official comparisons use one versioned, published methodology. Users can build personalized comparisons with their own category weights, but personalized weights never affect official rankings or official comparison results.

### 9.3 Where OpenAI (or similar LLM) fits — narration, not computation
The scoring engine above is deterministic code, not an LLM call. The LLM's job is strictly the **presentation layer**:
- Turn an already-computed result + its source numbers into fan-toned natural language ("Ronaldo takes this round on knockout goals, 42–31 — but Messi claws it back on chances created per 90...").
- Power free-form follow-up questions about a comparison ("what if we only count games since 2015?") by re-querying the deterministic engine and re-narrating, not by answering from the model's own memory.
- **Guardrail**: every number the model states must be passed into its prompt from the verified data layer for that call. It is never allowed to state a stat from its own training knowledge, since that knowledge can be stale or wrong (transfers, recent matches, corrections).
- Same pattern reused for quiz authoring: feed the LLM verified facts, have it generate question phrasing and plausible wrong answers — it doesn't invent the underlying facts.
- **Cost/latency control**: don't call the LLM live per user tap at scale. Pre-generate and cache narrations for popular comparisons; only call live for genuinely novel/personalized queries.

---

## 10. Rivalries, Communities & Friend Leagues

- Official/unofficial club communities (e.g. "Arsenal Nigeria") with their own leaderboards and discussion.
- Friend leagues: private groups competing on predictions/quizzes, shareable invite links.
- Rivalry framing surfaces naturally from club-vs-club and fan-vs-fan comparisons already in the Intelligence Engine.

---

## 11. Rankings, Leagues & Divisions

- Multiple simultaneous leaderboards: global, national, club-fan, friends, weekly, seasonal.
- **Divisions with promotion/relegation** (Bronze → Silver → Gold → Elite → Ultimate) so meaningful competition doesn't require being globally #1 — just beating the ~50 people in your division this season.
- Seasonal resets keep the ladder climbable for new/returning users instead of a permanently ossified top of the leaderboard.

---

## 12. Achievements & Rewards

- Achievement badges tied to real accomplishments (streaks, topic mastery, rivalry wins, top-100 finishes), shown on the Football Resume.
- Cosmetic rewards (avatars, club-themed profile cosmetics, badges) as a monetizable, non-pay-to-win reward layer.

---

## 13. Monetization

| Tier | Includes |
|---|---|
| Free | Daily challenge, practice quizzes, basic predictions, basic rankings, limited battles, streak (1 shield/week) |
| Premium Fan (subscription) | Unlimited battles, advanced Football IQ tools, historical/advanced comparisons, private leagues, advanced stats, extra streak shields, premium cosmetics, ad-free |

Additional revenue layers (post-MVP): sponsored competitions (brand-funded prize pools, e.g. "MTN Arsenal Challenge"), advertising against a football-passionate audience, digital cosmetics, eventual commerce/community bridge (fan → merch, fan → local sports-bar discovery).

---

## 14. AI Architecture

- LLM usage is confined to: comparison narration, quiz-authoring assistance (offline, human-reviewed for MVP), adaptive personalization copy, matchmaking assist, and (post-MVP) conversational "prove it" debate mode.
- Every fact-bearing AI output must be grounded in data passed into the prompt from the verified data layer for that call (RAG-style, not model memory).
- Cache/pre-generate AI narration for popular content to control cost and latency; reserve live calls for genuinely personalized/novel queries.

---

## 15. Football Data Architecture

**Decision (2026-09-14)**: dual-provider, not single-source, and explicitly **not an LLM as the data source**. AI (OpenAI or similar) hallucinating or mis-remembering a live score would corrupt predictions settlement and leaderboards — the one failure this product can least afford, given the whole comparison-engine premise (§9) is built on "always show your verified source." An LLM's role stays exactly as scoped in §9.3/§14: narrate verified numbers, never originate them.

- **Primary provider: football-data.org (free tier)** — fixtures, scores, basic stats for major competitions. Zero cost, sufficient to validate the MVP loop; rate-limited (10 req/min on free tier), so cache aggressively and don't poll harder than needed.
- **Fallback + verification provider: API-Football** — used in two situations:
  1. Primary is down or rate-limited → fall back to API-Football so predictions still settle on time.
  2. **Final match results specifically** (the value that settles predictions and moves leaderboards/rank) get checked against both providers when both are reachable. If they agree, settle automatically. If they disagree, don't silently pick one — flag it for manual review and hold that match's settlement rather than risk scoring it wrong.
- This dual-check is scoped **only to the settlement-critical path** (final scores). Everyday reads (browsing fixtures, showing a stat in-app) hit primary with fallback-on-failure only — no need to double-call both providers where a wrong or momentarily stale value isn't money/rank-affecting. Keeps the added complexity proportional to what's actually at stake.
- Revisit provider choice once usage data justifies the cost of an API-Football/Sportmonks paid tier or an Opta-grade source — likely needed before the Comparison Engine (v0.3+) ships, since it needs deeper historical stat coverage than the free tier offers.
- Domain model sketch:
```
Player
 └── Competition Stats
      ├── Premier League: appearances, minutes, goals, assists, ...
      ├── UCL: appearances, minutes, goals, assists, ...
      └── International: ...
Club
 └── Competition Stats (season-by-season)
Match
 └── Events (goals, cards, subs) + live state
```
- Every stat stored with `source` + `last_verified` for the "Why?" transparency requirement.

---

## 16. Fairness, Anti-Cheat & Moderation

- Rate-limit and pattern-detect abnormal answer speed/accuracy for Battle Rating integrity.
- Minimum sample-size rules (already specified in §9.2) double as a soft anti-gaming measure for comparisons.
- Community/chat surfaces (rivalries, friend leagues) need basic moderation/report tooling before public launch — scope depth is a post-MVP decision once community features ship.

---

## 17. Admin/CMS, Analytics, Notifications

- Admin tooling to manage: question bank, methodology weights/versions, sponsored competitions, featured content.
- Core analytics: activation, D1/D7/D30 retention, streak survival rate, battle completion rate, comparison shares, conversion to Premium.
- Notification triggers built around the proximity loop (§4): rank overtaken, close to next tier, streak at risk, friend leaderboard movement, matchday reminders for followed clubs.

---

## 18. Sharing & Virality

- Every major moment (tier-up, achievement, comparison result, Football Resume) produces a purpose-built share card, WhatsApp-first for the initial market.
- Disagreement with a comparison result is treated as a feature, not a bug — "Don't agree? Build your own comparison" turns arguing into engagement and sharing.

---

## 19. Technical Architecture

**Decision (2026-09-14)**: **Quasar (Vue), shipped as a PWA for v1.** Rationale: fastest path to a real, testable product to validate usership before committing to native build overhead; Quasar's Capacitor integration gives a documented path to compile an installable Android build later without a rewrite, once usage data justifies it. PWA also fits the low-data/low-lag requirement well (installable, cacheable, no app-store friction for first users).

- **Client**: Quasar/Vue PWA (v1) → Capacitor-compiled Android build once usership validates the loop. iOS/native-feel polish is a later decision, not a v1 concern.
- **Styling**: Tailwind CSS for all visual styling, using Quasar only for component structure/behavior — not Quasar's default Material Design theme, which reads dated/generic. Quasar components get restyled via Tailwind utility classes rather than themed through Quasar's own styling system. This is a direct carryover from a ShopBook lesson (same complaint about Quasar's default look there).
- **Backend: Supabase** (Postgres + Auth + Realtime + Storage), reused from ShopBook to avoid splitting tooling/expertise across two products. Its built-in Realtime channel also covers the live-match-event/battle-update requirement from earlier in this doc, so no separate WebSocket layer is needed.
- **Data freshness / no manual refresh** — carried over as a hard requirement from a real ShopBook fix: the app must never require the user to manually refresh the page/app for data to be current. When the app resumes from background/idle (tab refocus, mobile app foreground, network reconnect), Supabase Realtime subscriptions and any stale queries must auto-reconnect and refetch on their own. This matters more here than it did for ShopBook — live scores, live leaderboard movement, and streak/rank state during a match are core to the product's daily-return loop (§4), so stale data on resume would undercut the exact experience the product depends on. Treat this as a launch-blocking requirement, not a polish item.
- **Hosting/cost model**: primary recurring costs are Supabase + hosting + the football-data.org/API-Football usage from §15 (free tier to start); revisit once usage or the Comparison Engine (v0.3+) requires a paid data tier.

---

## 20. Security, Performance, Privacy/Compliance

- Standard auth/session security; no storage of payment data beyond what a subscription processor requires.
- Performance budget: sub-second interaction feedback on core loops (answer→next question, prediction submit); aggressive caching, lazy loading, low-data mode as launch requirements per §2.
- Privacy: standard data-protection practice for a consumer app collecting profile/activity data; revisit specific compliance obligations (e.g. NDPR for Nigeria) before public launch.

---

## 21. MVP Scope (v1) — deliberately minimal

Ship only what tests the core loop — everything else in this document is roadmap, not v1:

1. Sign up, pick a club
2. Daily Challenge (shared quiz) + Practice Mode with a curated static question bank
3. Match predictions (winner / score) for real fixtures, scored after the match
4. XP, Football IQ, streak + single Star Shield/week
5. Global Star Tier (single ladder, no club tier yet)
6. Leaderboards: global + friends (invite-link based, to solve cold-start — see below)
7. Football Resume (basic profile, shareable)

**Explicitly deferred past v1**: Comparison/Intelligence Engine, Battle Rating/PvP battles, Club Star Tier, divisions/promotion-relegation, communities, sponsorships, Premium tier, AI narration. These are v2+ once the core loop is validated.

**Cold-start decision needed**: leaderboards are meaningless with zero other users. v1 should either (a) seed a global leaderboard from day one using real activity across all early users regardless of friend graph, or (b) lean on invite-first onboarding so a user's first leaderboard is never empty. Recommend (a) for launch simplicity, with invite mechanics layered in immediately after.

---

## 22. Roadmap

- **V0.2**: Fan Battles + Battle Rating, Club Star Tier, basic achievements.
- **V0.3**: Comparison Engine v1 (deterministic scoring only, no AI narration yet), Premium tier.
- **V1 (full)**: AI narration layer on comparisons, divisions/promotion-relegation, communities/friend leagues, sponsorship tooling.
- **V2+**: multi-market expansion (Ghana/Kenya/SA/diaspora), additional sports/pop-culture verticals (explicitly out of scope until the football product proves the loop).

---

## 23. MVP Acceptance Criteria

- A new user can sign up, pick a club, and complete their first prediction + quiz in under 2 minutes.
- Daily streak and shield state are visible on every core screen, not buried in a settings page.
- A user with zero friends still sees a populated, meaningful leaderboard on day one.
- Prediction scoring and leaderboard updates reflect within a defined SLA after full-time (e.g. under 5 minutes) — exact number depends on chosen data provider's latency.
- Football Resume is shareable as an image/card outside the app (WhatsApp-ready) from day one.

---

## 24. Sprint Plan (MVP → v1)

Sprints, not calendar weeks — each one is a coherent, shippable chunk with a clear exit criterion. Move to the next sprint when the current one's exit criterion is actually met, not on a fixed clock. Sprints 0–5 deliver the MVP (§21) end to end; 6+ pick up the roadmap (§22). Content work (question bank authoring) is called out separately because it can run in parallel with engineering, not after it — don't let it become a launch blocker by leaving it until the end.

**Sprint 0 — Foundation**
- Supabase project: Auth, initial schema (users, clubs, matches, predictions, quiz_questions, quiz_attempts, xp_events)
- Quasar + Tailwind scaffold, PWA manifest/install config, base design system (restyled core components, no Quasar default theme)
- football-data.org integration: pull fixtures for the initial competition set
- API-Football account provisioned (fallback wiring can be stubbed, doesn't need to be load-bearing yet)
- Deploy pipeline (staging environment reachable from day one)
- *Exit criterion*: a fixture list from a real competition renders in the app end-to-end through the deployed pipeline.

**Sprint 1 — Identity & Onboarding**
- Sign up / log in (Supabase Auth)
- Pick a club (club list + selection, stored on profile)
- Bare profile shell (no Football Resume polish yet)
- *Exit criterion*: a new user can create an account and land on a home screen with their club set.

**Sprint 2 — Quiz Core (Practice + Daily Challenge)**
- *Parallel content track*: author the curated question bank (start with the user's club + top competitions; this can start in Sprint 0 and doesn't block engineering)
- Practice Mode UI (pick topic, answer, feedback), Football IQ scoring, per-topic accuracy tracking
- Daily Challenge (same questions for all users that day) + daily leaderboard
- *Exit criterion*: a user can complete a practice quiz and the day's Daily Challenge, and Football IQ updates visibly.

**Sprint 3 — Predictions & Matchday Settlement**
- Prediction submission (winner + exact score) on real fixtures, locked at kickoff
- Settlement job: pull final scores from football-data.org, cross-check against API-Football (§15's dual-check), award points, flag disagreements for manual review instead of guessing
- *Exit criterion*: a prediction made before a real fixture is correctly scored after full-time without manual intervention (barring a flagged disagreement).

**Sprint 4 — Progression, Streaks & Leaderboards**
- XP totals → Global Star Tier (single ladder, sub-levels)
- Streak counter + weekly Star Shield
- Global leaderboard + friends leaderboard (invite-link based)
- Proximity nudges surfaced in-app (e.g. "X XP to next tier") — full push-notification infra can be a fast-follow if it's not ready; the in-app version is the launch-blocking part
- *Exit criterion*: a brand-new user with zero friends still sees a populated, meaningful leaderboard (§23's cold-start requirement).

**Sprint 5 — Football Resume, Data Freshness Hardening & Launch**
- Football Resume: shareable profile card, exportable as an image (WhatsApp-ready)
- Data-freshness pass: verify Supabase Realtime subscriptions and stale queries actually auto-reconnect/refetch on app resume from background — test this explicitly, don't assume it from Sprint 0's wiring (this is the ShopBook idleness lesson; treat it as its own QA pass, not a side effect of other work)
- Low-data mode / caching pass, basic analytics events (§17) wired
- Soft launch to a real first cohort
- *Exit criterion*: all of §23's MVP acceptance criteria pass in production, with real users completing the full loop unassisted.

**Sprint 6 — Fan Battles & Battle Rating (v0.2 start)**
- 1v1 real-time quiz battles, Elo-style Battle Rating, basic matchmaking by rating
- *Exit criterion*: two users can complete a live battle and both ratings update correctly.

**Sprint 7 — Club Star Tier & Achievements (v0.2)**
- Second progression ladder tied to club-specific activity
- First batch of achievement badges on the Football Resume
- *Exit criterion*: a user's club-specific activity visibly moves a separate tier from their global one.

**Sprint 8 — Comparison Engine v1, deterministic only (v0.3 start)**
- Data/analytics/scoring layers from §9.1–9.2: stat winner, category winner, overall result, minimum sample sizes, "Too Close to Call", "Why?" breakdown
- No AI narration yet — plain structured output first, so the methodology itself is validated before language generation is layered on
- *Exit criterion*: a player-vs-player comparison produces a reproducible, source-cited result a user can drill into.

**Sprint 9 — Premium Tier & AI Narration (v0.3 → v1)**
- Payment integration, Premium Fan perks (extra shields, private leagues, advanced stats, cosmetics)
- AI narration layer on top of Sprint 8's engine (§9.3 guardrails: numbers only from what's passed into the prompt, cached for popular comparisons)
- *Exit criterion*: a paying user gets premium perks end-to-end, and a comparison result reads as fan-toned narrative, not a raw table.

**Sprint 10+ — Divisions, Communities, Sponsorships (v1 full)**
- Promotion/relegation divisions, friend leagues, club communities, sponsorship tooling
- Sequence within this block based on what Sprints 0–9's real usage data says users actually want most — don't pre-commit an order this far out.
