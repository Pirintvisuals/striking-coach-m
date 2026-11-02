# Striking Coach — Plan / Spec

Personal audio striking coach web app for **one user (Milan)** on an iPhone.
Opened in Safari, added to the home screen. Static, offline-capable PWA: no
accounts, no backend, no subscription. Keep it simple and single-user.

## Who it's for
- MMA striking, mostly Muay Thai and boxing. 2 years of boxing, ~1 year
  training alone. **Orthodox.**
- Style: long-range sniping (McGregor / Rufo): keep distance, **emphasis on
  straight punches**.
- **Loves pull counters** — wants a lot of them.
- Favourite strikes: jab, cross, up jab (lead-hand long uppercut from range, up
  through the guard), teep, head kicks (lead and rear), body cross → rear head
  kick, cross → lead head kick.
- Rare strikes: back kick, wheel kick, flying knee — about once a round at most.
- **No regular knees** (freestanding weighted bag moves away when kneed).
- Close range is good from boxing → only "punish and exit"
  (3-2 step out, 2-3-2 pivot out).
- **No southpaw for the first 4 weeks.**
- No music → voice-only audio.

## Callouts
- Numbers only for 1 (jab), 2 (cross), 3 (lead hook), 4 (rear hook).
  Everything else in words: "up jab", "body 2", "teep", "lead head kick",
  "pull", "step out", …
- English voice; voice itself doesn't matter.
- Pre-generated audio clips, one per word/strike, stitched at runtime (no lag).
  Generate with `edge-tts` (free, no account), plus spoken tips.
- Fallback if clips can't be generated: `speechSynthesis`, plus a local script
  to generate them.

## Big requirements
1. **Researched combos, not random ones.** Real setups and traps from Muay
   Thai, kickboxing and MMA, especially McGregor/Rufo range fighting.
   - **Trap sequences across several calls** (e.g. "jab, body 2" ×3, then
     "body 2, head kick" — the repeated pattern conditions, the last call
     exploits it).
   - Each combo/sequence has a one-line "why it works" (spoken as a tip).
   - Curated library, 60+ combos and traps, weighted heavily to straights and
     pull counters. No nonsense generator.
2. **Defence callouts.** Sometimes the coach calls an incoming attack ("jab",
   "cross", "rear low kick", "lead head kick", "teep"); he defends, ideally
   then counters ("cross incoming → pull, 2", "low kick → check, 2").
   - Researched defences per attack (pull, slip, roll, parry, check, catch,
     block, step back).
   - Proportion of defence calls is a setting; more frequent on counter days.

## Session structure (hands-free)
- 10 s countdown → 2-min warm-up round.
- 4 focus rounds × 4 min, 1 min rest.
- Final 2-min round: burnout on hard days, slow technical round on technical days.
- Each round starts with a spoken focus; each rest gives one spoken tip.
- Pace adapts to combo length.
- Bells and countdown sounds.
- Screen kept awake (Wake Lock API).
- Audio must play on iOS with the silent switch on → HTML `<audio>` element
  unlocked by the start tap, not Web Audio alone.

## Weekly system (6 days/week, rotation)
1. Snipe — hard
2. Kicks — technical
3. Pull counters & defence — hard
4. Snipe — technical
5. Kicks — hard
6. Pull counters & defence — technical

App always opens on the **next** session in the rotation (missed days don't matter).

## Logging
After each session: 1–5 rating + free-text note. History in localStorage.
"Export log" button copies the log as text (to paste to Claude for plan tweaks).

## Done means
- Works in a desktop browser at a phone-sized viewport.
- `PLAN.md` and the combo/defence library (with research sources) committed.
- README: free deploy (Vercel / GitHub Pages) + add to iPhone home screen.
- Report what couldn't be verified (iPhone silent switch, wake lock, bag height
  — default: call head kicks normally).
