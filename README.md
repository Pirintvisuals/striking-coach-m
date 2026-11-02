# Striking Coach

Personal, hands-free audio striking coach for the heavy bag. It's one static
web app (PWA) for one person: no accounts, no backend, and it works offline once loaded.
The spec is in [PLAN.md](PLAN.md), and every combo, trap and defence call with its
"why" and sources is in [LIBRARY.md](LIBRARY.md).

## What a session is (v2)

About 46 minutes with the defaults: 10 s countdown → **5-min warm-up** (footwork, then light
hands, light kicks, first incoming calls) → **3 × 10-min themed rounds** → **3-min finisher**,
with **2 min rest** before every round. Round length, rest and number of rounds are in
**Settings**.

Every themed round teaches one real setup from McGregor, Adesanya or Ruffy:

1. **Teach** (first ~15%): the coach says the theme and explains the setup in one sentence, then
   you drill it alone. After a few reps comes a short form cue.
2. **Mix** (to ~50%): the setup is mixed with related calls and its trap sequences.
3. **Hide** (to the end): the setup is hidden among everything else: straights, traps,
   incoming attacks, and **callbacks** to traps from earlier rounds ("Callback. The trap
   from round one." Then the pattern once, then the break).
4. Short coaching cues come about once a minute. Recovery between calls shrinks through the round,
   so intensity rises.

**Hard days** use short gaps, "Rapid fire" strings (3–4 short punch combos back to back), two
15–20 s all-out **flurries** in the middle of each round, and a flurry for the last 20 s. The
finisher is a **burnout**: 6 × (20 s all out, 10 s easy). **Technical days** have no flurries.
They use longer recovery and end each round with "Last minute. Perfect reps of the setup." The
finisher drills the day's setups slowly.

Rotation (the app always opens on the next one): Snipe hard → Kicks technical →
Pull counters & defence hard → Snipe technical → Kicks hard → Pull counters &
defence technical. You can pick another session on the home screen. Saving the log
moves the rotation on to the one after the session you did.

| | round 1 | round 2 | round 3 |
|---|---|---|---|
| Snipe | McGregor's straight (feint 1, 2) | Ruffy's in and out (step in, 2, 3, step out) | McGregor's pull counter (1, pull, 2) |
| Kicks | Adesanya's feints (feint 1, calf kick) | Front kick → question mark kick trap | McGregor's kicks and spins (front kick, 2 ×2 → back kick) |
| Counters | Pull counter defence (incoming cross → pull, 2) | Adesanya's check hook (incoming blitz → check hook, pivot out) | Ruffy's chaos (feint 1, wheel kick) |

**Incoming attacks** never come straight after a combo. First there's a clear silence, then an alert
chirp, then a **different voice** (female, US) says "Incoming cross!". The screen turns blue.
After a short reaction window the coach says the defence and counter ("Pull, two"). Offence
calls are always numbers in the coach's voice, so "one, two, cross" can't happen any more.
The share of incoming calls is set in **Settings** (15% by default). Each round theme multiplies
it, up to about 40% on defence rounds.

Spinning techniques, knees and elbows are capped: one spinning technique per round, or about 4 in
the McGregor/Ruffy spin rounds. In a simulated hard snipe session there were 842 jab/straight calls and
2 spinning ones.

## During a session

- **Skip** says what it skips: countdown, camera check, warm-up, **rest**, **lesson** (just the teach part, the round
  carries on) or round. **Settings → Rest → None** removes the rests completely.
- **Stop**: tap twice. It works at any moment, including the countdown, and the voice stops at once.
- **7. Build your own** on the home screen: pick hard or technical and 1–5 round themes from any day,
  for example McGregor's straight and then Adesanya's feints. It doesn't move the rotation.
- **Settings → Warm-up**: none, 2, 3 (default) or 5 min. Settings also has round length, rest and number of rounds.
- **Settings → Voice**: "Recorded clips" or "Phone voice only". In both modes, a combo that isn't fully
  in the recorded clips is said as one sentence by the phone voice. The app never switches voices mid-combo,
  because that's what made numbers disappear on iPhone in v2.

## Camera coach (optional, experimental)

Turn it on in **Settings → Camera coach**. It uses the **back** camera and MediaPipe Pose, which runs on the
phone, so no video leaves it. Use it like this:

1. Stand the phone **diagonal in front of you, 2–3 m away**, with your whole body in view from head to feet, in decent light.
2. After the countdown there's a ~40 s **calibration**. It checks it can see you, then asks you to
   hold your guard for 5 s (it learns *your* guard, so a low or extended lead hand counts as normal), throw 3
   jabs (it works out your lead hand), and throw 3 of your best 2s (that becomes your baseline for hip turn).
3. During the **themed rounds** it checks:
   - **Rear hand home**: after every 2, rear hook or rear elbow, the rear hand should be back within about 0.65 s, and stay at the chin between combos.
   - **Lead hand**: back after jabs and hooks. Between combos it only flags drops well below your own low guard.
   - **Hip turn on the 2**: how far your hips rotate on each called 2, compared with your calibration 2s.
   - **Kicks**: on a lead-leg kick the rear hand stays at the chin; on a rear-leg kick the lead hand stays up.
   - **Chin up / standing tall**, **stance turning square**, and **feet going still** between combos.
4. The run screen shows live numbers ("Rear home 12/14 · Hip 82% · Kick guard 5/7"). A third of the way into a round it says
   whether it can see your work ("Camera check: hands are coming home", or "I can't see your punches well").
5. Live cues ("Rear hand home", "Turn the hip on the two", …) come **between combos only**, at most
   once every 20 s, and the same cue at most once every 45 s. Flurries aren't judged.
6. During the rest after each round you get a short spoken **camera report**, with the worst one or two
   things and whether they got worse late in the round. The written version goes into the log and the export.

It can't judge whether you hit the bag, or the finer technique on kicks. A punch it couldn't see
clearly isn't counted either way. The pose library and model (`vendor/mediapipe`, ~15 MB used, Apache-2.0) download
the first time the camera runs and are cached for offline use after that.

## Deploy for free (pick one)

**GitHub Pages:** on GitHub, open the repo, go to **Settings → Pages**, set
Source to "Deploy from a branch" with branch `main` and folder `/ (root)`, then
Save. After a minute it's live at
`https://pirintvisuals.github.io/striking-coach-m/`. Pages only works on a
**public** repo on the free plan. If the repo is private, use Vercel.

**Vercel:** at vercel.com, choose **Add New → Project**, import
`striking-coach-m`, set Framework Preset to "Other", and leave the build command
empty. Then click Deploy. Pushing to `main` redeploys it.

## Put it on the iPhone home screen

1. Open the URL in **Safari**. Other browsers can't install web apps on iOS.
2. Tap **Share** (the square with an arrow), then **Add to Home Screen**, then **Add**.
3. Open it from the home-screen icon once while online, so it caches itself,
   including the 4 MB of voice clips. After that it works offline.
4. In **Settings → Test sound**, check that you hear the bell and voice with the
   ringer switch on silent.

Tips: turn the volume up before the session, and keep the phone unlocked. The app
holds the screen awake. If it says it couldn't, set iPhone Settings → Display &
Brightness → Auto-Lock to Never while you train.

## Voice clips

`audio/sprite.m4a` is generated with **edge-tts** (free Microsoft neural voices, no account):
`en-GB-RyanNeural` for the coach, and `en-US-AriaNeural` for incoming attacks only. Everything
is in a single sprite. The app plays everything through one HTML `<audio>` element that your Start
tap unlocks, which is what lets audio play with the iPhone silent switch on. Web Audio alone
would be muted.

The app uses a clip only if the sprite has that exact text. Any line that's missing or was edited
falls back to the phone's built-in voice (`speechSynthesis`), and incoming attacks fall back to a
US/female voice at a higher pitch. **Settings** shows how many lines are not in the clips yet.

The clips are rebuilt **automatically on GitHub** (`.github/workflows/build-audio.yml`) whenever
`library.json` or `tools/build_audio.py` changes. The workflow commits the new sprite, bumps the cache version in `sw.js`
and republishes the site. You can also start it by hand: **Actions → Build voice clips → Run workflow**.
To build locally instead:

```bash
pip install edge-tts
python tools/build_audio.py
python tools/build_library_md.py
```

You need ffmpeg on PATH for this. `build_library_md.py` also **audits every combo**: numbers only in offence, no
doubled or dead-end calls, no rear hand straight into a rear kick, known tokens, and real
sources. It exits with an error if something fails. Then bump `VERSION` in `sw.js` so the phone
picks up the new files, and push.

## Checking a session without training it

Open `index.html?sim&session=1&seed=7` (session 1–6 in rotation order). The whole session runs
instantly in virtual time and prints every call with its timestamp. `>>>` marks the incoming voice and `~`
marks sounds. Add `&quick` for quick-mode timings.

## Log

After each session, rate it 1–5 and add a note. **Log → Export log** copies
everything as text, ready to paste to Claude so it can adjust the plan. The log
lives in the browser's localStorage on the phone. Deleting the home-screen app
or clearing Safari data wipes it, so export now and then.

## Files

`index.html`, `style.css` and `app.js` are the app, and `camera.js` is the camera coach. `library.json` holds all combos,
traps, incoming attacks, round themes, flurries and spoken phrases. `audio/` has the voice sprite and
its index, plus the wake-lock fallback video. `sw.js` is the offline cache, and
`tools/` has the clip and doc generators.
