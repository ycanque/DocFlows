# Docker

Docker setup for Document Flow System PostgreSQL database.

## Services

- **postgres**: PostgreSQL 16 database
  - Port: 5432
  - Database: document_flow
  - User: postgres
  - Password: postgres

- **pgadmin**: pgAdmin web interface (optional)
  - Port: 5050
  - Email: admin@docflow.com
  - Password: admin

## Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f postgres

# Remove volumes (WARNING: deletes all data)
docker compose down -v
```

## Connection String

```
postgresql://postgres:postgres@localhost:5432/document_flow
```
