# Forbright onboarding forwarder

Simple Express + TypeScript app that receives onboarding form events and forwards them to a downstream ingestion endpoint.

## Quickstart (local, no Docker)

```bash
npm install
cp .env.example .env
npm run dev
```

Send a request:

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

## API docs

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

- `PORT`: server port (default `3000`)
- `INGEST_URL`: downstream ingest endpoint (default `https://dummy-s3-location.com/ingest`)
- `REQUEST_TIMEOUT_MS`: axios timeout in ms (default `3000`)
- `LOG_LEVEL`: pino log level (default `info`)

## SQL answers

See `sql/queries.sql`.

## Docker (API + Postgres)

```bash
docker compose up --build
```

The API will be available on `http://localhost:3000`.

## Docker Compose Watch (dev, no rebuild on code changes)

This uses Docker Compose Watch to sync `src/` changes into the running container.

```bash
docker compose -f docker-compose.yml -f docker-compose.watch.yml watch
```
