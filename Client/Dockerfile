FROM cgr.dev/chainguard/python:latest-dev AS builder

WORKDIR /app

RUN python -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p /app/data

# --- runtime stage: minimal image, no shell/pip/apk/compilers ---
FROM cgr.dev/chainguard/python:latest

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=client_project.settings \
    PATH="/app/venv/bin:$PATH"

WORKDIR /app

COPY --from=builder /app/venv /app/venv
COPY --from=builder /app /app

# Chainguard's :latest images default to nonroot (uid 65532) already, but
# pin it explicitly so a future base-image change can't silently grant root.
USER 65532

EXPOSE 8001

ENTRYPOINT ["python", "docker_entrypoint.py"]
