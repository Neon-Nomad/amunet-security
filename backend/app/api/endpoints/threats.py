from fastapi import APIRouter, HTTPException
from ...services.threat_intel import threat_intel_service
from ...services.honeypot_manager import honeypot_manager
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

router = APIRouter()

class ThreatEventCreate(BaseModel):
    agent_id: str
    event_type: str
    payload: Dict[str, Any]

class HoneypotDeployRequest(BaseModel):
    agent_id: str
    type: str
    config: Optional[Dict[str, Any]] = {}

@router.post("/events")
async def report_threat_event(event: ThreatEventCreate):
    try:
        result = await threat_intel_service.ingest_event(event.agent_id, event.event_type, event.payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events")
async def get_threats(limit: int = 10):
    return await threat_intel_service.get_recent_threats(limit)

@router.post("/honeypots/deploy")
async def deploy_honeypot(request: HoneypotDeployRequest):
    try:
        result = await honeypot_manager.deploy_honeypot(request.type, request.agent_id, request.config)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/honeypots")
async def list_honeypots(agent_id: Optional[str] = None):
    return await honeypot_manager.list_honeypots(agent_id)
