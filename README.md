# SQL-AI-POSTGRESQL Agent (v0.1) (Local, Deterministic & Tool-Driven)

This project is a local SQL generation agent built with Ollama and executed inside WSL. It analyzes your database metadata in real time and produces validated SQL using a strict tool-call protocol.

The backend is fully implemented. The frontend is under development and will be fully dockerized.

---

## Features

### Deterministic SQL Generation

* Schema and table discovery using `list_schemas` and `list_tables`.
* Real metadata inspection through `get_columns`, `get_primary_keys`, and `get_foreign_keys`.
* Query generation validated strictly against real schema information.
* No invented schemas, tables, or columns.
* Final SQL always returned inside a strict `FINAL_SQL` JSON structure.

### Local AI Execution

* Runs inside WSL.
* Powered by Ollama using the `qwen2.5-coder:14b` model. (You can use whichever model you want.)
* No cloud dependency.

### Metadata-Driven

* Dynamic introspection SQL scripts for PostgreSQL.
* Includes column descriptions, previews, and constraints.

### Persistent Connections

* All database connections stored in SQLite.
* Internal session handled with a lightweight singleton.

---

## Tech Stack

**Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL, SQLite

**AI Layer**: Ollama, Qwen 2.5 Coder 14B

**Design Patterns**: Singleton, Strategy, Builder, Adapter, Proxy

---

## How to Run the Project (Linux, WSL & Windows Compatible)

### 1. Requirements

* WSL (Ubuntu recommended)
* Python 3.10+
* PostgreSQL (local or remote)
* Ollama installed inside WSL

### 2. Start Ollama

```bash
ollama pull <model>
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```


### 4. Run FastAPI Backend

```bash
uvicorn app.main:app --reload
```

### 5. Access API Documentation (Swagger)

Once the server is running, visit:

```
http://localhost:8000/docs
```

### 6. Test SQL Generation

Send a POST request to:

```
POST /llmsql/generate_sql
```

Example body:

```json
{
  "input": "Insert 10 sample customers."
}
```

---

## Metadata Cache Implementation

The agent includes an in-memory metadata cache to avoid repeated introspection calls. During a session, schemas, tables, and column details are stored efficiently so that repeated user requests do not trigger new tool calls.

The cache structure:

```
metadata_cache = {
  schema_name: {
    table_name: {
      "columns": [...],
      "primary_keys": [...],
      "foreign_keys": [...]
    }
  }
}
```

This reduces latency, prevents unnecessary database queries, and speeds up SQL generation. A TTL or manual reset can be added as needed.

---

## Planned Improvements

* Complete Docker support (frontend + backend + Ollama).
* Frontend UI for schema visualization and agent reasoning.
* SQL beautifier and dry-run validator.
* Multi-database support (MySQL, SQL Server, Oracle).
* Multi-model comparison tools.

---

## Status

* **Backend**: v0.1
* **Frontend**: In progress
* **Deployment**: Local (WSL), Docker support planned soon
