from typing import Dict, Any, List
from datetime import datetime
import uuid

class ThreatIntelService:
    def __init__(self):
        # In-memory storage for MVP. Replace with Time-Series DB (TimescaleDB) later.
        self.threat_events: List[Dict[str, Any]] = []

    async def ingest_event(self, agent_id: str, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingests a threat event, analyzes it, and assigns a risk score.
        """
        risk_score = self._calculate_risk_score(event_type, payload)
        
        event = {
            "id": str(uuid.uuid4()),
            "agent_id": agent_id,
            "type": event_type,
            "payload": payload,
            "risk_score": risk_score,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "analyzed"
        }
        
        self.threat_events.append(event)
        
        # TODO: Trigger automated response if risk_score > threshold
        
        return event

    def _calculate_risk_score(self, event_type: str, payload: Dict[str, Any]) -> int:
        """
        Simple heuristic for risk scoring.
        """
        if event_type == "honeypot_interaction":
            return 80
        if event_type == "unauthorized_access":
            return 90
        if event_type == "port_scan":
            return 40
        return 10

    async def get_recent_threats(self, limit: int = 10) -> List[Dict[str, Any]]:
        return sorted(self.threat_events, key=lambda x: x["timestamp"], reverse=True)[:limit]

threat_intel_service = ThreatIntelService()
