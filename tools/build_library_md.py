"""Write LIBRARY.md (human-readable combo/defence library with sources) from library.json.
Run from the repo root:   python tools/build_library_md.py
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lib = json.load(open(os.path.join(ROOT, "library.json"), encoding="utf-8"))
S = lib["sources"]


def refs(e):
    return ", ".join(f"[{k}]" for k in e["src"])


out = ["# Combo & defence library", "",
       "Generated from `library.json` by `tools/build_library_md.py`. Edit the JSON, not this file.", "",
       "Orthodox stance. 1 jab, 2 cross, 3 lead hook, 4 rear hook; **up jab** = lead-hand long uppercut from range. "
       "`|` separates the calls of a trap sequence (each call is spoken a few seconds apart).", "",
       f"**Totals:** {len(lib['combos'])} combos, {len(lib['traps'])} trap sequences, {len(lib['rare'])} rare strikes "
       f"(max one per round), {len(lib['defence'])} defence calls.", ""]

out += ["## Combos", "", "| id | call | tags | why it works | src |", "|---|---|---|---|---|"]
out += [f"| {e['id']} | {e['calls']} | {' '.join(e['tags'])} | {e['why']} | {refs(e)} |" for e in lib["combos"]]
out += ["", "## Trap sequences", "", "The repeated calls condition the opponent; the last call exploits it.", "",
        "| id | sequence | why it works | src |", "|---|---|---|---|"]
out += [f"| {e['id']} | {e['calls']} | {e['why']} | {refs(e)} |" for e in lib["traps"]]
out += ["", "## Rare strikes (at most one per focus round, 60% of rounds)", "", "| id | call | why | src |", "|---|---|---|---|"]
out += [f"| {e['id']} | {e['calls']} | {e['why']} | {refs(e)} |" for e in lib["rare"]]
out += ["", "## Defence calls", "",
        "Alert chirp + the incoming attack (said in words, never numbers), a short reaction window, then the coach "
        "says the defence and counter (can be switched off in Settings).", "",
        "| id | incoming | defend → counter | why | src |", "|---|---|---|---|---|"]
out += [f"| {d['id']} | {d['attack']} | {d['answer']} | {d['why']} | {refs(d)} |" for d in lib["defence"]]

out += ["", "## Sources", "",
        "Research was done by web search (Nov 2026). The articles below are the ones the lines are based on; "
        "most are coaching blogs and fight breakdowns, not formal studies. `coach` marks lines that are standard "
        "striking logic with no single source.", "",
        "\"Rufo\" in the brief is read as **Mauricio Ruffy** (\"the Sniper\", UFC): long range, darting entries and "
        "exits. No breakdown of a fighter literally named Rufo was found.", ""]
out += [f"- **[{k}]** " + (f"[{v['title']}]({v['url']})" if v["url"] else v["title"]) for k, v in S.items()]

open(os.path.join(ROOT, "LIBRARY.md"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print("LIBRARY.md written")
