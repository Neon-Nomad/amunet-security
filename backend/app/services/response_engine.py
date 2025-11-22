from typing import Dict, Any, List
from .mtd_controller import mtd_controller
from .siem_connector import siem_connector
import uuid

class ResponseEngine:
    async def evaluate_and_respond(self, threat_event: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Evaluates a threat event and triggers automated responses based on playbooks.
        """
        actions_taken = []
        risk_score = threat_event.get("risk_score", 0)
        agent_id = threat_event.get("agent_id")

        # Forward to SIEM regardless of risk
        await siem_connector.forward_event(threat_event)

        # Playbook: High Risk Response
        if risk_score >= 80:
            # Action 1: Rotate IP immediately
            rotation_result = await mtd_controller.trigger_ip_rotation(agent_id)
            actions_taken.append({
                "action": "ip_rotation", 
                "reason": "high_risk_threat",
                "details": rotation_result
            })

            # Action 2: Isolate Node (Mock)
            isolation_result = await self._isolate_node(agent_id)
            actions_taken.append({
                "action": "isolate_node",
                "reason": "high_risk_threat",
                "details": isolation_result
            })

        return actions_taken

    async def _isolate_node(self, agent_id: str) -> Dict[str, Any]:
        # Mock isolation logic (e.g., move to quarantined VLAN)
        return {"status": "isolated", "agent_id": agent_id}

response_engine = ResponseEngine()
