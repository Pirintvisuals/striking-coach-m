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
- **4. Opponent**: no combo list to follow. The coach describes **what the opponent does** and **you choose the answer**.
  Pick who you fight on the home screen: the pressure fighter, the counter-puncher, the kicker, the brawler, or the southpaw.
  Each one has 3 habits ("He drops his hands when he kicks"). The coach never tells you what to throw or how to defend (no combos, no answers after his attacks): you read it and
  choose. Round 1 describes the habits in full. Round 2 only uses the short call ("Hands are low!"). In round 3 you're down on
  points and he switches to a new habit. He also attacks you with his own weapons, and "He's hurt! Finish him" is a flurry.

Every ~2 minutes a **spotlight** changes: one short line ("Spotlight: the liver. Go downstairs."),
the setup once, and then that family of combos comes up more often among everything else. The spotlights
come from the McGregor / Adesanya / Ruffy research and continue where the last session stopped.

Session: short intro → 2-min warm-up (real combos) → 3 × 10-min rounds → 3-min burnout, with 2-min rests.
Flurries and challenges are explained first, then "Ready." and a **beep**: go on the beep, stop on the next beep.
Rests are short: "Rest", the camera report if it's on, and "Ten seconds". During a session, **+10 s** jumps ahead
ten seconds, like skipping in a video. **Combos** on the home screen lists every combo, trap and incoming
attack with why it works.

## During a session

- **Skip** says what it skips: countdown, camera check, warm-up, **rest**, **lesson** (just the teach part, the round
  carries on) or round. **Settings → Rest → None** removes the rests completely.
- **Stop**: tap twice. It works at any moment, including the countdown, and the voice stops at once.
- **Settings → Warm-up**: none, 2 (default), 3 or 5 min. It's real combos from the first call, with no footwork-only part. Settings also has round length, rest and number of rounds.
- **Settings → Voice**: "Recorded clips" or "Phone voice only". In both modes, a combo that isn't fully
  in the recorded clips is said as one sentence by the phone voice. The app never switches voices mid-combo,
  because that's what made numbers disappear on iPhone in v2.

## Camera coach (optional)

Turn it on in **Settings → Camera coach**. It uses the back camera and MediaPipe Pose on the phone itself.
Stand the phone diagonal in front of you, 2–3 m away, head to feet in view.

- **Calibration** (~45 s before the warm-up): hold your guard, 3 jabs (finds the lead hand), 3 of your best 2s
  (hip-turn baseline), 3 of your best rear body kicks (kick baseline).
- **Every round is recorded** (Settings → Record each round). Under **Videos** on the home screen you get the
  round's video, the report, and a list of **marked moments** ("3:42 Weak hip on a kick"). Tap one and the video
  jumps there. **Save / share video** saves it to Photos. The last 6 rounds are kept on the phone.
- What it marks:
  - rear hand slow to come home, or dropped between combos;
  - the lead hand only if it drops far below your own guard (it stays out on purpose);
  - weak hip on a 2 or on a kick compared with your calibration;
  - head kicks below shoulder height, the kicking leg slow back to stance, the other hand dropping on a kick;
  - chin up, stance turned square, feet still.
- Live spoken cues are **off** by default (Settings → Live camera cues). A third into each round it only speaks up if it can't see you.
- The thresholds are first guesses from synthetic tests. Watch the marked moments and tell Claude which ones are wrong.

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
