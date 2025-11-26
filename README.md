# LLM SQL Agent – README

## 1. Requisitos previos

* Python 3.12
* Node.js 18+
* PostgreSQL
* Ollama instalado localmente
* Virtualenv recomendado

Modelos compatibles con Ollama. Por defecto se usa `qwen2.5-coder:14b`, pero puede cambiarse desde el panel o la API.

## 2. Configuración del entorno

Puedes gestionar las conexiones directamente desde el panel de administración o por API.
El sistema permite:

* Crear conexiones nuevas
* Guardar varias conexiones
* Seleccionar cuál usar como activa
* Cambiar entre conexiones en cualquier momento


## 3. Arquitectura del proyecto

Arquitectura por capas, organizada de forma modular:

* **Capa API**: Routers separados para SQL Agent, modelos, conexiones, cache, esquemas y mensajes.
* **Capa de servicios**: Lógica del dominio, SQL Agent, cache de metadatos, gestión de modelos, mensajes y conexiones.
* **Capa de repositorios**: Acceso a datos para modelos, mensajes, conexiones y cache.
* **Capa de dominio**: Modelos y esquemas con validaciones y tipos de request/response.
* **Capa de utilidades**: Parsers, builders de prompts y ejecutores de herramientas.
* **Capa núcleo**: Logger, middlewares y proveedor de metadata cache.
* **Frontend (Astro + React + Tailwind)**: Panel de administración para gestionar modelos, historial, logs y métricas.

## 4. Ejecutar el backend

Crear entorno virtual:

```
python3 -m venv venv
source venv/bin/activate
```

Instalar dependencias:

```
pip install -r requirements.txt
```

Levantar FastAPI:

```
uvicorn app.main:app --reload
```

Backend disponible en: [http://localhost:8000](http://localhost:8000)

## 4.1. Acceder a la documentación interactiva (Swagger / Redoc)

Una vez levantado el backend, puedes acceder a la documentación automática generada por FastAPI:

* Documentación Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
* Documentación Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 5. Configurar y ejecutar Ollama

Asegura que el servicio está corriendo:

```
ollama serve
```

Cargar el modelo recomendado:

```
ollama pull qwen2.5-coder:14b
```

El modelo activo puede modificarse desde el panel o por API.

## 6. Base de datos interna

Incluye una base SQLite interna para historial, configuraciones y modelos activos. Se genera automáticamente al iniciar el backend.

## 7. Ejecutar el panel de administración

Entrar en la carpeta `frontend`:

```
cd frontend
npm install
npm run dev
```

Disponible en: [http://localhost:4321/admin](http://localhost:4321/admin)

Permite gestionar:

* Historial de mensajes
* Eliminación y filtrado
* Modelos activos
* Estadísticas y métricas
* Logs del SQL Agent
* Configuración del sistema

## 8. Probar el SQL Agent

Enviar peticiones a:

```
POST /llmsql/generate_sql
```

Body:

```
{
  "user_input": "Describe aquí tu operación en lenguaje natural"
}
```

El agente ejecuta detección de esquema, tablas, introspección, validación de metadata y finalmente genera SQL determinista.

## 9. Eliminación de mensajes

```
DELETE /messages/user/{id}
DELETE /messages/assistant/{id}
```

## 10. Métricas y monitorización

Incluye:

* Logging avanzado
* Tiempo de ejecución por paso
* Control de loops
* Cache hits/misses
* Historial de modelos utilizados

## 11. Personalización

El proyecto permite:

* Añadir más modelos de Ollama
* Mejorar el sistema de cache
* Extender herramientas del agente
* Cambiar prompts del sistema
* Integrar otros motores SQL
* Ajustar reglas internas del agente

## 12. Objetivo del proyecto

Permitir que cualquier usuario trabaje con una base de datos sin escribir SQL, describiendo únicamente su intención. El agente se encarga de:

* Interpretación de lenguaje natural
* Gestión completa de metadata
* Selección y validación de tablas
* Generación y control del SQL
* Estabilidad, coherencia y rendimiento

Sistema diseñado para crecer en capacidades y velocidad, pensado para integrarse en plataformas más complejas que requieran automatización total del flujo SQL.
