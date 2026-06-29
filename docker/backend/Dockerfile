FROM python:3.13-slim

WORKDIR /app
ENV PYTHONPATH=/app

COPY pyproject.toml ./
RUN pip install --no-cache-dir . && pip uninstall -y pip

COPY . .

RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
