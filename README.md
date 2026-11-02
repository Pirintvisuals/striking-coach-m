# Striking Coach

Personal, hands-free audio striking coach for the heavy bag. It's one static
web app (PWA) for one person: no accounts, no backend, and it works offline once loaded.
The spec is in [PLAN.md](PLAN.md), and every combo, trap and defence call with its
"why" and sources is in [LIBRARY.md](LIBRARY.md).

## What a session is

10 s countdown → 2-min warm-up → 4 focus rounds × 4 min (1 min rest) → 2-min
final round (burnout on hard days, slow technical on technical days). Each
round opens with a spoken focus. Each rest gives one tip, the "why" of the combo
that opens the next round. A wood-block clack sounds 10 s before the bell, and a
"ten seconds" call plus 3-2-1 beeps end each rest.

Rotation (the app always opens on the next one): Snipe hard → Kicks technical →
Pull counters & defence hard → Snipe technical → Kicks hard → Pull counters &
defence technical. You can pick another session on the home screen. Saving the log
moves the rotation on to the one after the session you did.

**Defence calls** have a blue screen, an alert chirp, and the incoming attack named
in words ("cross!"). After a short reaction window the coach says the defence and
counter ("pull, two"). The share of these calls is set in **Settings**, 15% by
default. Counter days multiply it by 2 to 3.5 depending on the round.

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

The `audio/sprite.m4a` file was generated with **edge-tts** (Microsoft neural
voice `en-GB-RyanNeural`, free and with no account). It's a single sprite with
every word, tip and sound in it. The app plays everything through one HTML `<audio>`
element that your Start tap unlocks, which is what lets audio play with the
iPhone silent switch on. Web Audio alone would be muted. If the sprite is missing,
the app falls back to the phone's built-in `speechSynthesis` voice.

After editing `library.json`, for example to add combos, regenerate the clips and the doc:

```bash
pip install edge-tts
python tools/build_audio.py
python tools/build_library_md.py
```

You need ffmpeg on PATH for this. Then bump `VERSION` in `sw.js` so the phone
picks up the new files, and push.

## Log

After each session, rate it 1–5 and add a note. **Log → Export log** copies
everything as text, ready to paste to Claude so it can adjust the plan. The log
lives in the browser's localStorage on the phone. Deleting the home-screen app
or clearing Safari data wipes it, so export now and then.

## Files

`index.html`, `style.css` and `app.js` are the app. `library.json` holds all combos,
traps, defence calls, sessions and round focuses. `audio/` has the voice sprite and
its index, plus the wake-lock fallback video. `sw.js` is the offline cache, and
`tools/` has the clip and doc generators.
