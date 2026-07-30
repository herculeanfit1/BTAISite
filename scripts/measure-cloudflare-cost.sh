#!/usr/bin/env bash
# Measure what the Cloudflare layer costs this site, by comparing the apex
# against the SWA origin serving the IDENTICAL build.
#
# Why a comparison and not a single measurement: the apex and the origin run the
# same code, so any difference between them is the edge, not the application.
# That isolation is the whole reason this script exists -- a bare apex score
# cannot tell you whether 79 means "slow app" or "slow edge", and this repo spent
# real time on that ambiguity.
#
# Read-only. Makes HTTP requests and runs Lighthouse; changes nothing.
#
# Usage:
#   ./scripts/measure-cloudflare-cost.sh            # 3 runs each (default)
#   RUNS=1 ./scripts/measure-cloudflare-cost.sh     # quick look
#
# Run it BEFORE and AFTER any Cloudflare dashboard change to see whether the
# change did what was expected. Expect run-to-run variance on the apex of ~20
# performance points: the bot-detection script's long task is not deterministic,
# so a single run cannot tell an improvement from noise. That is why the default
# is 3 and why the median is reported alongside the range.

set -uo pipefail

APEX="${APEX:-https://bridgingtrust.ai/}"
ORIGIN="${ORIGIN:-https://wonderful-bush-0e888f30f.6.azurestaticapps.net/}"
RUNS="${RUNS:-3}"

command -v npx >/dev/null || { echo "npx not found" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Deterministic check: is JavaScript Detections being injected right now?
#
# Run this BEFORE reaching for the Lighthouse numbers. The scores are noisy --
# the apex has swung 64 to 86 on unchanged code -- so they are a poor way to
# answer a yes/no question. The JSD injection is a byte in the HTML, so it
# answers deterministically and in one request.
#
# The failure mode this guards against: treating "grep found nothing" as
# "Cloudflare is not injecting it", when the real cause was a request that
# never succeeded. That is the cleanup-pr bug in a different costume, so
# fetch-failed and not-present are reported as different states.
jsd_check() { # $1=url  $2=label
  local url="$1" label="$2" body status
  body="$(curl -sS --max-time 20 -w '\n%{http_code}' "$url" 2>/dev/null)" || {
    echo "  $label: FETCH FAILED -- this is not evidence of absence"; return 2; }
  status="${body##*$'\n'}"
  body="${body%$'\n'*}"
  if [ "$status" != "200" ]; then
    echo "  $label: HTTP $status -- not a usable sample"; return 2
  fi
  # Positive control: the response must look like this site at all, or a grep
  # miss says nothing. An error page would also contain no JSD.
  if ! printf '%s' "$body" | grep -q 'Bridging Trust'; then
    echo "  $label: HTTP 200 but does not look like this site -- refusing to conclude"; return 2
  fi
  if printf '%s' "$body" | grep -q 'challenge-platform'; then
    echo "  $label: JS Detections IS injected (challenge-platform present)"; return 0
  fi
  echo "  $label: JS Detections is NOT injected"; return 1
}

echo "JavaScript Detections presence (deterministic -- check this first):"
jsd_check "$APEX" "apex  "; apex_jsd=$?
jsd_check "$ORIGIN" "origin"; origin_jsd=$?
if [ "$origin_jsd" = "0" ]; then
  echo "  WARNING: the origin is also injecting JSD. It is not behind Cloudflare," >&2
  echo "           so this comparison no longer isolates the edge." >&2
fi
echo

if [ "${JSD_ONLY:-}" = "1" ]; then
  exit $apex_jsd
fi

if [ -z "${CHROME_PATH:-}" ]; then
  CHROME_PATH="$(node -e "console.log(require('playwright').chromium.executablePath())" 2>/dev/null || true)"
  export CHROME_PATH
fi
[ -n "${CHROME_PATH:-}" ] || { echo "No Chrome found. Set CHROME_PATH or run: npx playwright install chromium" >&2; exit 1; }

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

measure() { # $1=url  $2=label
  local url="$1" label="$2" out="$work/$2"
  mkdir -p "$out"
  echo "  measuring $label ($RUNS run(s))..." >&2
  ( cd "$out" && npx --yes @lhci/cli@0.15.1 collect \
      --url="$url" --numberOfRuns="$RUNS" --settings.preset=desktop >/dev/null 2>&1 )
  python3 - "$out" "$label" <<'PY'
import json, glob, statistics, sys
d, label = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(d + "/.lighthouseci/lhr-*.json"))
if not files:
    print(json.dumps({"label": label, "error": "no reports"})); sys.exit()
cats = {c: [] for c in ("performance", "accessibility", "best-practices", "seo")}
tbt = []
for f in files:
    r = json.load(open(f))
    for c in cats:
        s = r["categories"].get(c, {}).get("score")
        if s is not None:
            cats[c].append(round(s * 100))
    v = r["audits"].get("total-blocking-time", {}).get("numericValue")
    if v is not None:
        tbt.append(v)
print(json.dumps({
    "label": label,
    "runs": len(files),
    "cats": {c: {"med": statistics.median(v), "min": min(v), "max": max(v)} for c, v in cats.items() if v},
    "tbt": {"med": round(statistics.median(tbt)), "min": round(min(tbt)), "max": round(max(tbt))} if tbt else None,
}))
PY
}

echo "Comparing the Cloudflare-fronted apex against the bare SWA origin."
echo "  apex:   $APEX"
echo "  origin: $ORIGIN"
echo

a="$(measure "$APEX" apex)"
o="$(measure "$ORIGIN" origin)"

python3 - "$a" "$o" <<'PY'
import json, sys
apex, origin = json.loads(sys.argv[1]), json.loads(sys.argv[2])
if "error" in apex or "error" in origin:
    print("measurement failed:", apex.get("error") or origin.get("error")); sys.exit(1)

print("%-16s %-22s %-22s %s" % ("category", "apex (Cloudflare)", "origin (bare SWA)", "edge cost"))
print("-" * 78)
for c in ("performance", "accessibility", "best-practices", "seo"):
    A, O = apex["cats"].get(c), origin["cats"].get(c)
    if not (A and O):
        continue
    delta = A["med"] - O["med"]
    flag = "" if delta >= 0 else "  <-- %d pts" % -delta
    print("%-16s %-22s %-22s %s%s" % (
        c,
        "%d  (%d-%d)" % (A["med"], A["min"], A["max"]),
        "%d  (%d-%d)" % (O["med"], O["min"], O["max"]),
        ("%+d" % delta) if delta else "0", flag))

if apex["tbt"] and origin["tbt"]:
    print("%-16s %-22s %-22s %+d ms" % (
        "TBT",
        "%d ms (%d-%d)" % (apex["tbt"]["med"], apex["tbt"]["min"], apex["tbt"]["max"]),
        "%d ms (%d-%d)" % (origin["tbt"]["med"], origin["tbt"]["min"], origin["tbt"]["max"]),
        apex["tbt"]["med"] - origin["tbt"]["med"]))

print()
print("Ranges are shown because the apex is NOT deterministic -- the bot-detection")
print("script's long task varies run to run. If a before/after difference is inside")
print("the ranges above, it is noise, not an improvement.")
PY
