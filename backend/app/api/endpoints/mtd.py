from fastapi import APIRouter, HTTPException
from ...services.mtd_controller import mtd_controller
from pydantic import BaseModel

router = APIRouter()

class RotationRequest(BaseModel):
    agent_id: str

class PortShuffleRequest(BaseModel):
    agent_id: str
    service: str
    old_port: int
    new_port: int

@router.post("/rotate-ip")
async def rotate_ip(request: RotationRequest):
    try:
        result = await mtd_controller.trigger_ip_rotation(request.agent_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/shuffle-port")
async def shuffle_port(request: PortShuffleRequest):
    try:
        result = await mtd_controller.trigger_port_shuffle(
            request.agent_id, 
            request.service, 
            request.old_port, 
            request.new_port
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
