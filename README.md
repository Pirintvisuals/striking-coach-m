# Striking Coach

Personal, hands-free audio striking coach for the heavy bag. It's one static
web app (PWA) for one person: no accounts, no backend, and it works offline once loaded.
The spec is in [PLAN.md](PLAN.md), and every combo, trap and defence call with its
"why" and sources is in [LIBRARY.md](LIBRARY.md).

## What a session is (v6)

There are three options, all hard, and every round mixes **everything**: straights, hooks (1, 3, 2), the liver
shot, uppercuts, kicks (body, head, calf, side kick, front kick, question mark), superman punch, clinch on the bag,
long fast strings, rapid fire, flurries, a challenge, and a lot of incoming attacks.

- **1. Fight mix**: everything.
- **2. Counters and defence**: everything, with about twice as many incoming attacks and more pull counters.
- **3. Kicks**: everything, but kick-heavy, and most incoming attacks are kicks.

Every ~2 minutes a **spotlight** changes: one short line ("Spotlight: the liver. Go downstairs."),
the setup once, and then that family of combos comes up more often among everything else. The spotlights
come from the McGregor / Adesanya / Ruffy research and continue where the last session stopped.

Session: short intro → 2-min warm-up (real combos) → 3 × 10-min rounds → 3-min burnout, with 2-min rests.
Rests are short: "Rest", the camera report if it's on, and "Ten seconds". During a session, **Faster / Slower**
changes the tempo (it's remembered). **Combos** on the home screen lists every combo, trap and incoming
attack with why it works.

## During a session

- **Skip** says what it skips: countdown, camera check, warm-up, **rest**, **lesson** (just the teach part, the round
  carries on) or round. **Settings → Rest → None** removes the rests completely.
- **Stop**: tap twice. It works at any moment, including the countdown, and the voice stops at once.
- **Settings → Warm-up**: none, 2 (default), 3 or 5 min. It's real combos from the first call, with no footwork-only part. Settings also has round length, rest and number of rounds.
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
   - **Kicks** (calibration adds 3 rear body kicks): hip turn on round kicks against your calibration kicks; head kicks reaching
     head height; the kicking leg back to stance within ~0.9 s; and the other hand staying up (rear hand on lead-leg kicks,
     lead hand on rear-leg kicks).
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
