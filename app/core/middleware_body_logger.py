import json
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.logger import logger

class BodyLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        try:
            request_body = await request.body()
            request_body_text = request_body.decode("utf-8") if request_body else ""
        except Exception:
            request_body_text = "[Unable to read request body]"

        logger.info(
            f"REQUEST {request.method} {request.url.path} | "
            f"Body={request_body_text}"
        )

        def receive():
            return {"type": "http.request", "body": request_body}

        request = Request(request.scope, receive)

        response = await call_next(request)

        response_body = b""
        async for chunk in response.body_iterator:
            response_body += chunk

        duration = (time.time() - start_time) * 1000

        try:
            response_text = response_body.decode("utf-8")
        except Exception:
            response_text = "[Unable to decode response body]"

        logger.info(
            f"RESPONSE {request.method} {request.url.path} | "
            f"Status={response.status_code} | "
            f"Duration={duration:.2f}ms | "
            f"Body={response_text}"
        )

        return Response(
            content=response_body,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.media_type
        )
