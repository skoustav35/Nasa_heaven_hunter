"""
Sarkar AstroForge — Unified FastAPI Microservice

Combines the legacy ExoHunter endpoints (enqueue-profile, status, verify-archive,
evaluate-cnn) with the new Ensemble Astrophysics Engine (/ensemble-analyze).

Run: uvicorn api:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

# ─── Unified App ────────────────────────────────────────────────

app = FastAPI(
    title="Sarkar AstroForge API",
    description="Unified scientific engine: Legacy ExoHunter + Ensemble Astrophysics Engine",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════
# ENSEMBLE ASTROPHYSICS ENGINE (Phase 5)
# ═══════════════════════════════════════════════════════════════

# Import the engine from exohunter package
from exohunter.app import engine, InputData as EnsembleInput, analyze as ensemble_analyze_handler

@app.post("/ensemble-analyze")
async def ensemble_analyze(data: EnsembleInput):
    """Core MCP-connected endpoint. Triggered by run_ensemble_analysis MCP tool."""
    return await ensemble_analyze_handler(data)


# ═══════════════════════════════════════════════════════════════
# LEGACY EXOHUNTER ENDPOINTS
# ═══════════════════════════════════════════════════════════════

class ProfileRequest(BaseModel):
    tic_id: str
    period_days: float
    transit_duration_hours: Optional[float] = None

class ArchiveRequest(BaseModel):
    tic_id: str
    radius: Optional[float] = None
    period: Optional[float] = None


@app.post("/enqueue-profile")
async def enqueue_profile(req: ProfileRequest) -> Dict[str, Any]:
    try:
        from celery.result import AsyncResult
        from exohunter.celery_app import app as celery_app
        if celery_app is None:
            raise HTTPException(status_code=500, detail="Celery is not configured.")
        task = celery_app.send_task(
            "exohunter.run_profile_scan",
            args=[req.tic_id, req.period_days, req.transit_duration_hours, {}],
        )
        return {
            "job_id": task.id,
            "status": "QUEUED",
            "tic_id": req.tic_id,
            "period_days": req.period_days,
        }
    except ImportError:
        raise HTTPException(status_code=500, detail="Celery not available.")


@app.get("/status/{job_id}")
async def get_status(job_id: str) -> Dict[str, Any]:
    try:
        from celery.result import AsyncResult
        from exohunter.celery_app import app as celery_app
        if celery_app is None:
            raise HTTPException(status_code=500, detail="Celery is not configured.")
        result = AsyncResult(job_id, app=celery_app)
        response = {
            "job_id": job_id,
            "status": result.status,
            "ready": result.ready(),
            "successful": result.successful() if result.ready() else False,
        }
        meta = result.info if isinstance(result.info, dict) else None
        if meta:
            response["meta"] = meta
            if "progress" in meta:
                response["progress"] = meta["progress"]
            if "stage" in meta:
                response["stage"] = meta["stage"]
        if result.ready():
            if result.successful():
                response["result"] = result.result
            else:
                response["error"] = str(result.result)
        return response
    except ImportError:
        raise HTTPException(status_code=500, detail="Celery not available.")


@app.post("/verify-archive")
async def verify_archive(req: ArchiveRequest) -> Dict[str, Any]:
    try:
        from exohunter.grounding import verify_against_nasa_archive
        return verify_against_nasa_archive(req.tic_id, req.radius, req.period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class CNNRequest(BaseModel):
    flux: List[float]


@app.post("/evaluate-cnn")
async def evaluate_cnn(req: CNNRequest) -> Dict[str, Any]:
    try:
        from exohunter.cnn_vetting import evaluate_transit_cnn
        return evaluate_transit_cnn(req.flux)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    """Health check with engine dependency status."""
    from exohunter.app import (
        _HAS_LIGHT_CURVE,
        _HAS_LIGHTKURVE,
        _HAS_SNCOSMO,
        _HAS_STINGRAY,
    )
    return {
        "status": "operational",
        "version": "3.0.0",
        "engines": {
            "ensemble_engine": True,
            "light_curve": _HAS_LIGHT_CURVE,
            "sncosmo": _HAS_SNCOSMO,
            "stingray": _HAS_STINGRAY,
            "lightkurve": _HAS_LIGHTKURVE,
        },
    }
