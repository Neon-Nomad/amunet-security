from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, Dict, Any

class AgentBase(BaseModel):
    hostname: str
    os_type: str
    ip_address: str

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    status: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    last_seen: Optional[datetime] = None

class AgentResponse(AgentBase):
    id: UUID4
    status: str
    config: Dict[str, Any]
    last_seen: datetime
    created_at: datetime

    class Config:
        from_attributes = True
