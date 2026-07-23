#!/usr/bin/env python3
"""Print how many seconds ago the Static Web App build last changed.

Reads the JSON body of
`GET .../staticSites/<name>/builds/default?api-version=2023-01-01` on stdin and
writes a single integer to stdout:

  >= 0  the build is Ready and was last updated that many seconds ago
  -1    the build is not Ready, the payload is unusable, or the timestamp
        could not be parsed

Callers treat -1 as "not settled" and keep waiting, so an unparseable payload
fails closed rather than green-lighting a re-link.

Why this exists: re-linking the Function App backend while a deployment is
still settling corrupted the routing on 2026-07-22 badly enough that the
backend captured "/" instead of "/api/*" and the whole site served the Azure
Functions placeholder for 21 minutes. The deploy workflow uses this to wait
until the build has been quiet for several minutes first.
"""

import datetime
import json
import re
import sys

# Azure returns either 2026-07-23T03:30:22.2997812Z or ...+00:00, and the
# fractional part routinely exceeds the 6 digits fromisoformat accepts.
TIMESTAMP = re.compile(
    r"^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})"  # base
    r"(?:\.(\d+))?"                            # optional fractional seconds
    r"(Z|[+-]\d{2}:\d{2})?$"                   # optional timezone
)


def build_age_seconds(payload: str) -> int:
    try:
        properties = json.loads(payload).get("properties") or {}
    except (ValueError, AttributeError):
        return -1

    if properties.get("status") != "Ready":
        return -1

    match = TIMESTAMP.match(properties.get("lastUpdatedOn") or "")
    if not match:
        return -1

    base, fraction, timezone = match.groups()
    normalised = "{}.{}{}".format(
        base,
        (fraction or "0")[:6],
        "+00:00" if timezone in (None, "Z") else timezone,
    )

    try:
        updated = datetime.datetime.fromisoformat(normalised)
    except ValueError:
        return -1

    now = datetime.datetime.now(datetime.timezone.utc)
    return int((now - updated).total_seconds())


if __name__ == "__main__":
    print(build_age_seconds(sys.stdin.read()))
