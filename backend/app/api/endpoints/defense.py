from fastapi import APIRouter, HTTPException
from ...services.response_engine import response_engine
from pydantic import BaseModel
from typing import Dict, Any, List

router = APIRouter()

class ManualResponseRequest(BaseModel):
    threat_event: Dict[str, Any]

@router.post("/trigger-response")
async def trigger_manual_response(request: ManualResponseRequest):
    try:
        actions = await response_engine.evaluate_and_respond(request.threat_event)
        return {"status": "executed", "actions": actions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
