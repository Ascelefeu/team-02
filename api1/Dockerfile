# Dockerfile pour ./api1/Dockerfile
FROM python:3.11-slim

# Sécurité : non-root 
RUN addgroup --system appgroup && adduser --system --group appuser

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R appuser:appgroup /app

USER appuser

# Healthcheck 
HEALTHCHECK --interval=30s CMD curl -f http://localhost:5000/health || exit 1

CMD ["python", "app.py"]