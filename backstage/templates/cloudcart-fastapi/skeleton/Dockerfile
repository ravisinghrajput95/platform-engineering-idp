FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir .

COPY app ./app

EXPOSE ${{ values.port }}

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "${{ values.port }}"]
