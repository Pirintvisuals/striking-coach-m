"""Write LIBRARY.md (human-readable library with sources) from library.json, and audit every call.
Run from the repo root:   python tools/build_library_md.py
Exits with code 1 if the audit finds a problem (fix library.json, or mark a deliberate exception with "ok").
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lib = json.load(open(os.path.join(ROOT, "library.json"), encoding="utf-8"))
S = lib["sources"]
ALL = lib["combos"] + lib["traps"]
BY_ID = {e["id"]: e for e in ALL + lib["defence"]}

# ---------- audit ----------
# Every token the coach can say. A typo here would silently create a new clip, so unknown tokens fail the audit.
STRIKES = {"1", "2", "3", "4", "body jab", "body 2", "body 3", "up jab", "check hook",
           "teep", "front kick", "low kick", "calf kick", "oblique kick", "lead body kick", "rear body kick",
           "lead head kick", "rear head kick", "question mark kick", "back kick", "wheel kick", "spinning back fist",
           "knee", "flying knee", "lead elbow", "rear elbow",
           "liver shot", "lead uppercut", "rear uppercut", "side kick", "superman punch",
           "switch knee", "double leg", "spinning back elbow", "rear teep"}
EXITS = {"step out", "pivot out", "angle out", "frame out"}
MOVES = {"pull", "slip", "roll", "parry", "check", "catch", "block", "step back", "step in", "shoulder roll",
         "hop back", "sprawl", "circle left", "circle right", "clinch",
         "feint 1", "feint 2", "feint kick", "feint low kick", "feint level change", "shoulder feint", "hip feint"}
VOCAB = STRIKES | EXITS | MOVES
REAR_HAND = {"2", "body 2"}
REAR_KICK = {"rear head kick", "rear body kick", "low kick", "calf kick", "knee"}
DOUBLE_OK = {"1", "pull", "up jab", "parry", "knee"}  # no teep-teep / front kick-front kick: the bag moves away
SPIN = re.compile(r"back kick|wheel kick|spinning|flying knee")

problems, notes = [], []


def steps(s):
    return [[t.strip() for t in st.split(",") if t.strip()] for st in s.split("|")]


# Opponent answers are checked by the same rules (as one-step combos).
OPP = [{"id": f"{o['id']}:{i}", "calls": ans, "src": ["coach"]}
       for o in lib.get("opponents", []) for i, h in enumerate(o["habits"] + [o["adapt"]]) for ans in h["answers"]]
OPP += [{"id": f"situation:{i}", "calls": ans, "src": ["coach"]} for i, h in enumerate(lib.get("situations", [])) for ans in h["answers"]]
DEF_ATTACKS = {d["attack"] for d in lib["defence"]}
for o in lib.get("opponents", []):
    for a_ in o["attacks"]:
        if a_ not in DEF_ATTACKS:
            problems.append(f"opponent {o['id']}: no incoming entry for '{a_}'")
for e in ALL + OPP:
    st = steps(e["calls"])
    for i, s in enumerate(st):
        last_step = i == len(st) - 1
        for t in s:
            if t not in VOCAB:
                problems.append(f"{e['id']}: unknown token '{t}'")
            if re.search(r"\bcross\b", t) or (re.search(r"\bhook\b", t) and t != "check hook"):
                problems.append(f"{e['id']}: '{t}' names a punch in words; offence uses numbers")
        if ", ".join(s).replace(" ", "").find("1,2,3") >= 0 and "1, 2, 3" in ", ".join(s):
            problems.append(f"{e['id']}: '1, 2, 3' (Milan: use 1, 3, 2)")
        for a, b in zip(s, s[1:]):
            if a == b and a not in DOUBLE_OK:
                problems.append(f"{e['id']}: '{a}, {b}' repeats a token")
            if a in REAR_HAND and b in REAR_KICK and not e.get("ok"):
                problems.append(f"{e['id']}: rear hand straight into a rear-leg strike ('{a}, {b}'): hips are not reloaded")
        if s and s[-1] in MOVES and s[-1] not in ("circle left", "circle right") and (last_step or len(st) == 1):
            problems.append(f"{e['id']}: ends on '{s[-1]}' (should end on a strike or an exit)")
    if e.get("ok"):
        notes.append(f"{e['id']} ({e['calls']}): kept on purpose: {e['ok']}")
def parry_check(eid, toks, rear_attack):
    # The rear hand parries a jab/teep, so the lead hand fires first; only a parried cross is answered with the 2.
    for a, b in zip(toks, toks[1:]):
        if a == "parry" and b in REAR_HAND and not rear_attack:
            problems.append(f"{eid}: 'parry, {b}': the rear hand just parried, so the lead hand fires first")


for e in lib["combos"] + lib["traps"]:
    for s_ in steps(e["calls"]):
        parry_check(e["id"], s_, False)
for d in lib["defence"]:
    parry_check(d["id"], steps(d["answer"])[0], d["attack"] in ("cross", "rear hook", "overhand"))
    for t in steps(d["answer"])[0]:
        if t not in VOCAB:
            problems.append(f"{d['id']}: unknown token '{t}' in answer")
for e in ALL + lib["defence"]:
    for k in e["src"]:
        if k not in S:
            problems.append(f"{e['id']}: unknown source '{k}'")
for sid, sp in lib["spotlights"].items():
    for i in [sp["setup"], *sp["family"]]:
        if i not in BY_ID:
            problems.append(f"spotlight {sid}: unknown id '{i}'")
for se in lib["sessions"]:
    for sid in se.get("spotlights", []):
        if sid not in lib["spotlights"]:
            problems.append(f"session {se['id']}: unknown spotlight '{sid}'")


# ---------- markdown ----------
def refs(e):
    return ", ".join(f"[{k}]" for k in e["src"])


FN = {"mcgregor": "McGregor", "adesanya": "Adesanya", "ruffy": "Ruffy"}
fighter = lambda e: FN.get(e.get("fighter"), "")
n_spin = sum(1 for e in ALL if SPIN.search(e["calls"]))

out = ["# Combo & defence library", "",
       "Generated from `library.json` by `tools/build_library_md.py`. Edit the JSON, not this file.", "",
       "Orthodox stance. 1 jab, 2 cross, 3 lead hook, 4 rear hook; **up jab** = lead-hand long uppercut from range; "
       "**check hook** = lead hook thrown while pivoting off the line. "
       "`|` separates the calls of a trap sequence. McGregor is southpaw: his straight left is Milan's **2**, and his "
       "kicks to his right side are mirrored here.", "",
       f"**Totals:** {len(lib['combos'])} combos, {len(lib['traps'])} trap sequences, {len(lib['defence'])} incoming attacks with answers, "
       f"{len(lib['spotlights'])} spotlights. {n_spin} entries contain a spinning or flying technique; the engine caps them "
       "per round (1 per round, more during the McGregor/Ruffy spin spotlights), so jabs and straights stay far more frequent.", ""]

out += ["## Sessions and spotlights", "",
        "Three options, all hard. Every round mixes everything. Every ~2 minutes a **spotlight** "
        "(one short spoken line) makes one setup and its family come up more often, then the next spotlight takes over.", ""]
for se in lib["sessions"]:
    out.append(f"- **{se['name']}**: incoming attacks ×{se['def']}, spotlights: " + ", ".join(lib["spotlights"][x]["name"] for x in se.get("spotlights", [])))
out += ["", "| spotlight | spoken | setup | family |", "|---|---|---|---|"]
for sid, sp in lib["spotlights"].items():
    su = BY_ID[sp["setup"]]
    out.append(f"| {sp['name']} | {sp['say']} | `{su.get('calls') or 'incoming ' + su['attack'] + ' → ' + su['answer']}` | {', '.join(sp['family'])} |")
out.append("")

if lib.get("opponents"):
    out += ["## Opponent mode", "",
            "Situations instead of combos: the coach describes what the opponent does, you choose the answer. Round 1 names his habits and "
            "gives one answer after the window; round 2 uses only the short tell; round 3 he switches to a new habit and you're down on points.", ""]
    for o in lib["opponents"]:
        out += [f"**{o['name']}**: {o['style']} Throws: {', '.join(o['attacks'])}.", "", "| tell | short call | answers | why |", "|---|---|---|---|"]
        for h in o["habits"] + [dict(o["adapt"], tell="(round 3) " + o["adapt"]["tell"])]:
            out.append(f"| {h['tell']} | {h['short']} | {' / '.join(h['answers'])} | {h['why']} |")
        out.append("")
    out += ["**Situations (every opponent)**", "", "| situation | answers |", "|---|---|"]
    out += [f"| {h['tell']} | {' / '.join(h['answers'])} |" for h in lib["situations"]]
    out.append("")

out += ["## Combos", "", "| id | call | fighter | tags | why it works | src |", "|---|---|---|---|---|---|"]
out += [f"| {e['id']} | {e['calls']} | {fighter(e)} | {' '.join(e['tags'])} | {e['why']} | {refs(e)} |" for e in lib["combos"]]
out += ["", "## Trap sequences", "",
        "The repeated calls condition the opponent; the last call breaks the pattern. Later rounds call back to traps "
        "done earlier in the session (pattern once, then the break).", "",
        "| id | sequence | fighter | why it works | src |", "|---|---|---|---|---|"]
out += [f"| {e['id']} | {e['calls']} | {fighter(e)} | {e['why']} | {refs(e)} |" for e in lib["traps"]]
out += ["", "## Incoming attacks", "",
        "A forced pause after the last combo, an alert chirp, then a **different voice** (female, en-US) says "
        "\"Incoming cross!\". After a short reaction window the coach says the defence and counter (can be switched off).", "",
        "| id | incoming | defend → counter | fighter | why | src |", "|---|---|---|---|---|---|"]
out += [f"| {d['id']} | {d['attack']} | {d['answer']} | {fighter(d)} | {d['why']} | {refs(d)} |" for d in lib["defence"]]
out += ["", "## Flurries", "", "Hard days: two 15–20 s all-out flurries in the middle of every round, plus the last 20 s. "
        "The burnout finisher is 6 × (20 s on, 10 s off).", "",
        "| flurry | spoken |", "|---|---|"]
out += [f"| {k} | {v['say']} |" for k, v in lib["flurries"].items()]

out += ["", "## Audit", "", "Changes from v1:", ""] + [f"- {a}" for a in lib["audit"]]
out += ["", "Automatic checks (run on every build of this file): "
        + ("**all passed.**" if not problems else f"**{len(problems)} problems:**"), ""]
out += [f"- {p}" for p in problems]
out += [f"- {n}" for n in notes]

out += ["", "## Sources", "",
        "Research was done by web search (Nov 2026). The articles below are the ones the lines are based on; "
        "they are fight reports and breakdowns, not formal studies. In this build the pages could not be opened directly "
        "from the build machine, so the fighter claims rest on the search-result summaries of these pages; open the "
        "links to check a detail. `coach` marks lines that are standard striking logic with no single source; "
        "`user_lead` marks research leads from Milan's feedback that no breakdown found in search confirmed "
        "(e.g. Adesanya's jab to make them slip into a high kick, Ruffy mixing spins into fast combos).", ""]
out += [f"- **[{k}]** " + (f"[{v['title']}]({v['url']})" if v["url"] else v["title"]) for k, v in S.items()]

open(os.path.join(ROOT, "LIBRARY.md"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print("LIBRARY.md written")
for p in problems:
    print("AUDIT:", p)
sys.exit(1 if problems else 0)
