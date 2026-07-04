from fastapi import FastAPI

app = FastAPI(
    title="${{ values.serviceName }}",
    description="${{ values.description }}",
)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "${{ values.serviceName }}"}


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}
