from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.api.routes import devices, validations, sync
from app.core.database import engine, Base, get_db
from app.utils.seed import seed_database
import app.models  # Importa todos os models para registrar no Base.metadata
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

# Adicionando CORS Middleware para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar os domínios reais (ex: "http://localhost:5173")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(devices.router, prefix=f"{settings.API_V1_STR}/devices", tags=["devices"])
app.include_router(validations.router, prefix=f"{settings.API_V1_STR}/validations", tags=["validations"])
app.include_router(sync.router, prefix=f"{settings.API_V1_STR}/sync", tags=["sync"])

@app.get("/")
async def root():
    return {"message": "Welcome to NetGuardian API", "docs": "/docs"}

@app.post(f"{settings.API_V1_STR}/seed", tags=["seed"])
async def seed_data(db: AsyncSession = Depends(get_db)):
    """
    Popula o banco de dados com dispositivos e validações de teste.
    """
    inserted = await seed_database(db)
    if inserted:
        return {"message": "Seed executado com sucesso. Banco populado."}
    return {"message": "Banco de dados já contém informações. Seed ignorado."}
