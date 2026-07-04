# ${{ values.serviceName }}

${{ values.description }}

## Getting started

```bash
pip install -e ".[dev]"
uvicorn app.main:app --reload --port ${{ values.port }}
```

## Testing

```bash
pytest
```

## Endpoints

- `GET /` - service metadata
- `GET /healthz` - health check
