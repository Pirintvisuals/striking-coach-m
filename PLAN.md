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

## Build notes (2026-11-02)
- Voice: **edge-tts clips generated** (`en-GB-RyanNeural`) into one sprite,
  `audio/sprite.m4a` (204 clips, ~4 MB). `speechSynthesis` is only a fallback.
- Library: 68 combos, 20 trap sequences, 6 rare strikes, 32 defence calls
  (see LIBRARY.md). "Rufo" read as Mauricio Ruffy ("the Sniper").
- No southpaw content at all yet. Add it after week 4 if wanted.
- Head kicks are on by default; Settings has a toggle in case the bag doesn't reach head height.
- Not verified on a real iPhone: silent-switch playback, Wake Lock in the
  home-screen app, sprite seek latency.

## v2 (2026-11-02): after the first sessions

Feedback, and what changed:
1. **"One, two, cross" sounded stupid.** v1 named incoming attacks in the coach voice right
   after numbered combos, so they blended. Now incoming attacks get a forced silence, then an
   alert chirp, then a **second voice** (en-US female) saying "Incoming cross!". Offence is
   numbers only, and `tools/build_library_md.py` audits every combo (words for punches in offence,
   doubled tokens, dead-end calls, rear hand straight into a rear kick, unknown tokens and sources).
2. **Real combos.** McGregor, Adesanya and Ruffy material with sources in LIBRARY.md (`fighter`
   column). Leads that no breakdown confirmed are marked `user_lead`.
3. **More variety.** Front kick, question mark kick, oblique kick, check hook, hop back, shoulder
   and hip feints, knees, elbows, spinning back kick, wheel kick and back fist. Spinning
   techniques are capped per round, so jabs and straights stay far more common.
4. **Tempo.** Hard days have short gaps that shrink through the round, "rapid fire" strings, two
   15–20 s flurries per round plus the last 20 s, and a 6 × 20/10 burnout finisher.
5. **Session ≈ 45 min.** 5 min warm-up, 3 × 10 min themed rounds, 2 min rests, 3 min finisher.
   Round length, rest and round count are settings. The 6-day rotation, log and export are kept.
6. **Coaching, not a random caller.** Each round teaches one setup (a spoken teach line, then a
   drill), mixes it in, then hides it. There are coaching cues about once a minute, intensity
   rises through the round, and later rounds call back to traps from earlier ones.

The session structure section above describes v1 (4 × 4 min). It is superseded by this one.

## v3 (2026-11-02): optional camera coach

Milan asked for a camera that tells him what to improve, and asked to be asked rather than assumed. His
answers were: bladed stance, guard with the lead hand low/extended, phone diagonal in front, watch both hands
coming home, chin/standing tall, feet (flat or square), **and technique like the hip turn**, live cues plus
a report, camera optional.

- Off by default (Settings). MediaPipe Pose (lite) runs on the phone at ~15 fps, only in themed rounds.
- It never uses a textbook guard: a ~40 s calibration learns his guard, his lead hand and his best-2 hip turn.
- Because the app knows exactly when it called each strike, it can judge every called 2 (hip
  rotation vs his own baseline) and every called punch (did that hand come home within ~0.65 s).
- Cues come between combos only, rate-limited. A spoken report after each round and a written one in the log/export.
- Not judged: hitting the bag, kick technique, anything it couldn't see clearly.

## v4 (2026-11-02): first phone test

Milan's feedback on the Snipe hard day: numbers weren't spoken ("1, 2, low kick" came out as just
"low kick", sometimes cut), Stop didn't work during "get ready", he wants to skip parts, and he wants to
mix themes (some snipe, some kicks) without sitting through whole sessions or slow warm-ups.

- Cause of the missing numbers (most likely): v2 lines missing from the sprite used the iPhone speech engine,
  and switching between it and the `<audio>` sprite made iOS swallow the short number clips. Fixes: the full sprite is now built
  by a GitHub Action (edge-tts works there), combos are never split between the two systems, clips start
  inside the silence before them, and there's a "Phone voice only" setting as a fallback.
- Skip button; two-tap Stop that works at any moment; "Build your own" session (1–5 themes from any
  day, hard or technical, outside the rotation); warm-up length setting (default 3 min), faster warm-up.

## v5 (2026-11-02): second phone test

- Words still lost at the start of clips ("up jab" → "jab", "low kick" → "kick", "teep" and incoming calls
  unheard). The sprite now holds **whole combos as one clip** ("Up jab, two."), has 0.6 s of silence between clips, and the app
  starts each clip ~0.5 s early inside that silence. The alert chirp is part of each "Incoming …" clip.
- Content: no teep-teep or double front kick inside one combo (the bag moves away). Parry logic: the rear hand parries a jab or teep, so the
  lead hand fires first ("parry, 1, 2"); only a parried cross is answered with the 2. More up jab ↔ 2,
  more body kicks, sprawls. The audit enforces the parry rule and the no-double-kick rule.
- Less boring: the lesson is ~35–45 s and mixes in related calls from the 3rd rep, "Again!" repeats, one challenge per round,
  a flurry and rapid-fire strings on technical days too, faster technical pace, a sprawl flurry in the burnout.
- Skip says what it skips (rest, lesson, round…); "Skip lesson" keeps the round; rest can be set to none.
- Camera: back camera; checks that the other hand stays up on kicks; live numbers on screen; a spoken check-in a third of the way
  into each round, so it's clear whether it can see him.

## v6 (2026-11-02): "too many categories, too boring"

- Three hard options (Fight mix / Counters and defence / Kicks), every round mixes everything; the 9 fighter
  themes became 14 two-minute spotlights. Intros and rests are short.
- New material: hooks (1, 3, 2: Milan's favourite; no 1, 2, 3, enforced by the audit), liver shot, uppercuts,
  clinch on the bag (grab, knees, elbow, frame out), lead side kick, superman punch, 16 long fast strings.
- More incoming attacks (default 25%), faster base tempo, Faster/Slower buttons, a Combos screen.
- Camera: kick checks (hip turn against calibration kicks, head kicks reaching head height, leg back to stance, other hand up).
- Asked and answered: comparing Milan to McGregor / Adesanya / Ruffy / O'Malley footage isn't done. There's no
  pose data of their strikes to compare with, and measuring it from fight video from one phone angle would be guesswork. The camera
  compares him with his own calibration instead.
