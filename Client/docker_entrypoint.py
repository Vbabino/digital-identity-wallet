#!/usr/bin/env python
"""
Runtime entrypoint for the minimal (shell-less) Chainguard runtime image.
Runs migrations, then execs into gunicorn so it becomes PID 1.
"""

import os
import subprocess
import sys

subprocess.run([sys.executable, "manage.py", "migrate", "--noinput"], check=True)

os.execvp(
    "gunicorn",
    [
        "gunicorn",
        "client_project.wsgi:application",
        "--bind",
        "0.0.0.0:8001",
        "--workers",
        "2",
    ],
)
