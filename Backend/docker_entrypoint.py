#!/usr/bin/env python
"""
Runtime entrypoint for the minimal (shell-less) Chainguard runtime image.
Runs migrations, then execs into gunicorn so it becomes PID 1 (signals from
`docker stop` reach it directly instead of a wrapper process).
"""

import os
import subprocess
import sys
import time

# On a cold start (fresh postgres_data volume), Postgres initialization can
# take several seconds — depends_on only guarantees the container started,
# not that Postgres is accepting connections yet. Retry with backoff instead
# of crash-looping until it's ready.
_MIGRATE_RETRIES = 5
_MIGRATE_BACKOFF_SECONDS = 2

for attempt in range(1, _MIGRATE_RETRIES + 1):
    result = subprocess.run([sys.executable, "manage.py", "migrate", "--noinput"])
    if result.returncode == 0:
        break
    if attempt == _MIGRATE_RETRIES:
        sys.exit(result.returncode)
    print(
        f"migrate failed (attempt {attempt}/{_MIGRATE_RETRIES}), "
        f"retrying in {_MIGRATE_BACKOFF_SECONDS}s...",
        file=sys.stderr,
    )
    time.sleep(_MIGRATE_BACKOFF_SECONDS)
    _MIGRATE_BACKOFF_SECONDS *= 2

os.execvp(
    "gunicorn",
    [
        "gunicorn",
        "config.wsgi:application",
        "--bind",
        "0.0.0.0:8000",
        "--workers",
        "3",
        "--timeout",
        "60",
    ],
)
