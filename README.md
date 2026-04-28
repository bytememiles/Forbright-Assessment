# Forbright onboarding forwarder + ingestion service

Two-service Express + TypeScript setup:
- **Forwarder API**: receives onboarding events and forwards them to ingestion.
- **Ingestion service**: stores raw events + normalized customers in Postgres (via Prisma).

## Project structure

```text
services/forwarder/   # POST /onboarding (+ /docs, /openapi.json)
services/ingest/      # POST /ingest (persists to Postgres via Prisma)
db/init/              # Postgres init SQL
sql/                  # SQL answers
```

## Quickstart (Docker)

```bash
docker compose up --build
```

### Health checks

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:8080/health
```

### Forwarder path (client → forwarder → ingest)

```bash
curl -i -X POST "http://localhost:3000/onboarding" \
  -H "content-type: application/json" \
  -H "x-request-id: demo-req-1" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }'
```

### Direct ingestion (Postman/curl → ingest)

```bash
curl -i -X POST "http://localhost:8080/ingest" \
  -H "content-type: application/json" \
  -H "x-request-id: ingest-direct-1" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com"
  }'
```

## API docs

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`

## Configuration (Docker)

The Docker setup configures defaults via `docker-compose.yml`. Key env vars:

- `PORT`: server port (default `3000`)
- `INGEST_URL`: ingestion endpoint (default `http://ingest:8080/ingest`)
- `REQUEST_TIMEOUT_MS`: axios timeout in ms (default `3000`)
- `LOG_LEVEL`: pino log level (default `info`)

## SQL answers

See `sql/queries.sql`.

## Verify persisted data

```bash
docker compose exec db psql -U forbright_app -d forbright_app_db -c "SELECT * FROM onboarding_events ORDER BY received_at DESC LIMIT 5;"
docker compose exec db psql -U forbright_app -d forbright_app_db -c "SELECT * FROM customers ORDER BY created_at DESC LIMIT 10;"
```

## Docker Compose Watch (dev, no rebuild on code changes)

This uses Docker Compose Watch to sync source changes into running containers.

```bash
docker compose -f docker-compose.yml -f docker-compose.watch.yml watch
```
