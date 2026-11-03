"""Build audio/sprite.m4a + audio/sprite.json from library.json.

Every call token, incoming attack (second voice) and spoken line becomes one clip. Clips are
generated with edge-tts (free, no account), trimmed, and concatenated into a
single sprite with silence between them, so the app can play everything from
ONE <audio> element (needed for iOS: one element unlocked by the start tap).

Needs: python 3.9+, `pip install edge-tts`, ffmpeg on PATH.
Run from the repo root:   python tools/build_audio.py
Generated TTS mp3s are cached in tools/.cache so re-runs are fast.
"""
import asyncio, hashlib, json, os, subprocess, sys, wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "tools", ".cache")
OUT = os.path.join(ROOT, "audio")
VOICE = "en-GB-RyanNeural"      # the coach: every offence call, cue and spoken line
VOICE_IN = "en-US-AriaNeural"   # incoming attacks only: a clearly different voice
RATE = 24000
GAP = 0.6  # seconds of silence between clips: the app starts each clip ~0.45 s early, inside this silence,
           # because iPhone swallows the first moments after a seek ("up jab" came out as "jab")

NUM = {"1": "one", "2": "two", "3": "three", "4": "four"}
# Keys whose string values are spoken lines (app.js says them by text: clip id "x:" + text).
SPOKEN = {"say", "cue", "teach", "focus", "tip", "intro", "cues", "tell", "short"}


def say_token(tok):
    """Text for a call token: numbers spoken as words. Must match sayToken() in app.js."""
    words = [NUM.get(w, w) for w in tok.split()]
    return " ".join(words).capitalize() + "."


def say_step(tokens):
    """One whole combo as one sentence: 'Up jab, two.' Must match sayStep() in app.js."""
    words = [" ".join(NUM.get(w, w) for w in t.split()) for t in tokens]
    s = ", ".join(words)
    return s[0].upper() + s[1:] + "."


def steps_of(calls):
    for step in calls.split("|"):
        toks = [t.strip() for t in step.split(",") if t.strip()]
        if toks:
            yield toks


def tokens_of(calls):
    for step in calls.split("|"):
        for t in step.split(","):
            t = t.strip()
            if t:
                yield t


def lines(o, key=None, all_strings=False):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from lines(v, k, all_strings)
    elif isinstance(o, list):
        for v in o:
            yield from lines(v, key, all_strings)
    elif isinstance(o, str) and o.strip() and (all_strings or key in SPOKEN):
        yield o


def collect(lib):
    """id -> (text, rate, voice). Ids must match app.js: t:<token>, in:<attack>, x:<spoken text>."""
    clips = {}
    # Whole combos (one clip per step, said fluently) plus single tokens (used for "rapid fire" and as backup).
    for e in lib["combos"] + lib["traps"]:
        for st in steps_of(e["calls"]):
            clips["s:" + ", ".join(st)] = (say_step(st), "+12%", VOICE)
        for t in tokens_of(e["calls"]):
            clips["t:" + t] = (say_token(t), "+15%", VOICE)
    for d in lib["defence"]:
        clips["in:" + d["attack"]] = (f"Incoming {d['attack']}!", "+10%", VOICE_IN)
        for st in steps_of(d["answer"]):
            clips["s:" + ", ".join(st)] = (say_step(st), "+12%", VOICE)
        for t in tokens_of(d["answer"]):
            clips["t:" + t] = (say_token(t), "+15%", VOICE)
    for tq in lib.get("techniques", []):
        clips["t:" + tq["call"]] = (say_token(tq["call"]), "+15%", VOICE)
    # Opponent mode: every answer is a whole-combo clip too.
    for h in [h for o in lib.get("opponents", []) for h in o["habits"] + [o["adapt"]]] + lib.get("situations", []):
        for ans in h["answers"]:
            for st in steps_of(ans):
                clips["s:" + ", ".join(st)] = (say_step(st), "+12%", VOICE)
            for tok in tokens_of(ans):
                clips["t:" + tok] = (say_token(tok), "+15%", VOICE)
    for group in ("combos", "traps", "spotlights", "sessions", "warmup", "flurries", "opponents", "situations", "techniques"):
        for text in lines(lib[group]):
            clips["x:" + text] = (text, "+0%", VOICE)
    for text in lines(lib["phrases"], all_strings=True):
        clips["x:" + text] = (text, "+5%", VOICE)
    for ch in lib["phrases"].get("challenges", []):
        clips["x:" + ch["say"]] = (ch["say"], "+5%", VOICE)
    return clips


async def tts(text, rate, voice, path):
    import edge_tts
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, voice, rate=rate).save(path)
            return
        except Exception as e:  # network hiccups
            if attempt == 3:
                raise
            print("  retry:", text, e)
            await asyncio.sleep(2)


def ff(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def to_pcm(src, dst, trim=True):
    filt = []
    if trim:  # strip leading/trailing silence so stitched calls are tight
        s = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02"
        filt = ["-af", f"{s},areverse,{s},areverse"]
    ff("-i", src, *filt, "-ac", "1", "-ar", str(RATE), "-sample_fmt", "s16", dst)


def synth_fx(dst, expr, dur):
    ff("-f", "lavfi", "-i", f"aevalsrc='{expr}':s={RATE}:d={dur}", "-ac", "1", "-sample_fmt", "s16", dst)


FX = {
    "fx:silence": ("0", 0.5),  # first: the start tap unlocks audio by playing from 0
    # bell: inharmonic partials with exponential decay
    "fx:bell": ("0.5*exp(-2.2*t)*(sin(2*PI*830*t)+0.6*sin(2*PI*1660*t+1)+0.4*sin(2*PI*2490*t)+0.3*sin(2*PI*1920*t))/2.3", 1.6),
    "fx:bell3": ("0.5*exp(-5*mod(t,0.45))*(sin(2*PI*830*t)+0.6*sin(2*PI*1660*t+1)+0.4*sin(2*PI*2490*t))/2", 1.35),
    "fx:beep": ("0.45*sin(2*PI*880*t)*lt(t,0.15)", 0.18),
    # 10-second warning: two wood-block clacks
    "fx:clack": ("0.8*exp(-60*mod(t,0.22))*sin(2*PI*1800*t)*lt(t,0.44)", 0.45),
    # incoming-attack alert: quick rising double chirp
    "fx:alert": ("0.4*sin(2*PI*(600+2400*mod(t,0.12))*t)*lt(mod(t,0.15),0.12)", 0.3),
}


async def main():
    lib = json.load(open(os.path.join(ROOT, "library.json"), encoding="utf-8"))
    clips = collect(lib)
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)

    todo = []
    for cid, (text, rate, voice) in clips.items():
        h = hashlib.sha1(f"{voice}|{rate}|{text}".encode()).hexdigest()[:16]
        mp3 = os.path.join(CACHE, h + ".mp3")
        clips[cid] = (text, rate, mp3)
        if not os.path.exists(mp3):
            todo.append((text, rate, voice, mp3))
    print(f"{len(clips)} spoken clips, {len(todo)} to generate")
    sem = asyncio.Semaphore(6)

    async def one(job):
        async with sem:
            await tts(*job)
    await asyncio.gather(*(one(j) for j in todo))

    pcm, index, pos = bytearray(), {}, 0.0
    gap = b"\x00\x00" * int(GAP * RATE)
    items = [(cid, None, v) for cid, v in FX.items()] + [(cid, v[2], None) for cid, v in clips.items()]
    for cid, mp3, fx in items:
        wav = os.path.join(CACHE, "tmp.wav")
        if fx:
            synth_fx(wav, *fx)
        else:
            to_pcm(mp3, wav)
        with wave.open(wav) as w:
            frames = w.readframes(w.getnframes())
        if cid.startswith("in:"):  # alert chirp + short pause + "Incoming ...!" as ONE clip (one seek on iPhone)
            synth_fx(wav, *FX["fx:alert"])
            with wave.open(wav) as w:
                alert = w.readframes(w.getnframes())
            frames = alert + b"\x00\x00" * int(0.15 * RATE) + frames
        dur = len(frames) / 2 / RATE
        index[cid] = {"s": round(pos, 3), "d": round(dur, 3)}
        if not fx:
            index[cid]["text"] = clips[cid][0]
        if cid.startswith("in:"):
            index[cid]["alert"] = True
        pcm += frames + gap
        pos += dur + GAP

    big = os.path.join(CACHE, "sprite.wav")
    with wave.open(big, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(bytes(pcm))
    # AAC in .m4a: Safari seeks it accurately (mp4 has a sample index)
    ff("-i", big, "-c:a", "aac", "-b:a", "48k", "-movflags", "+faststart", os.path.join(OUT, "sprite.m4a"))
    json.dump({"voice": VOICE, "voiceIncoming": VOICE_IN, "gap": GAP, "clips": index}, open(os.path.join(OUT, "sprite.json"), "w"), indent=0)
    print(f"sprite: {pos:.0f}s, {len(index)} clips -> audio/sprite.m4a")


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
