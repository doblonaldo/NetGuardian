from fastapi import FastAPI
from app.core.config import settings
from app.api.routes import devices, validations, collect
from app.core.database import engine, Base
import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # In production, use Alembic for migrations instead of creating tables directly.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.include_router(devices.router, prefix=f"{settings.API_V1_STR}/devices", tags=["devices"])
app.include_router(validations.router, prefix=f"{settings.API_V1_STR}/validations", tags=["validations"])
app.include_router(collect.router, prefix=f"{settings.API_V1_STR}/collect", tags=["collect"])

@app.get("/")
async def root():
    return {"message": "Welcome to NetGuardian API", "docs": "/docs"}
