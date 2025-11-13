import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.logger import logger

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        logger.info(f"Incoming request: {request.method} {request.url.path}")

        response: Response = await call_next(request)

        duration = (time.time() - start_time) * 1000
        logger.info(
            f"Completed {request.method} {request.url.path} "
            f"Status={response.status_code} Duration={duration:.2f}ms"
        )

        return response
