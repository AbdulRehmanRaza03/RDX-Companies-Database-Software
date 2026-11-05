# Database Backup & Restore

The database is PostgreSQL (local, database name `rdx_leadflow`). Use `pg_dump` for
backups and `psql` for restoration (as required by the documentation).

## Prerequisites

PostgreSQL bin directory on PATH, or use the full path. On this machine the binaries
are at `C:\Program Files\PostgreSQL\16\bin`.

## Backup

```bash
export PGPASSWORD=abdul123
"/c/Program Files/PostgreSQL/16/bin/pg_dump" -U postgres -h localhost -d rdx_leadflow > backup.sql
```

Custom-format backup (recommended, allows selective restore):

```bash
"/c/Program Files/PostgreSQL/16/bin/pg_dump" -U postgres -h localhost -d rdx_leadflow -Fc > backup.dump
```

## Restore

```bash
export PGPASSWORD=abdul123
# Create the database if missing:
"/c/Program Files/PostgreSQL/16/bin/createdb" -U postgres -h localhost rdx_leadflow
# Restore:
"/c/Program Files/PostgreSQL/16/bin/psql" -U postgres -h localhost -d rdx_leadflow < backup.sql
```

For custom-format `.dump` files:

```bash
"/c/Program Files/PostgreSQL/16/bin/pg_restore" -U postgres -h localhost -d rdx_leadflow backup.dump
```

## Testing restoration

1. Back up the current database.
2. Create a new empty database (e.g. `rdx_leadflow_restore_test`).
3. Restore into it.
4. Verify row counts and query a few tables.
5. Drop the test database.
