from typing import Dict, Any, List
import uuid

class HoneypotManager:
    def __init__(self):
        self.active_honeypots: Dict[str, Dict[str, Any]] = {}

    async def deploy_honeypot(self, type: str, agent_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulates deploying a honeypot container on the agent.
        In production, this would send a command to the agent to `docker run ...`
        """
        honeypot_id = str(uuid.uuid4())
        deployment_info = {
            "id": honeypot_id,
            "type": type,
            "agent_id": agent_id,
            "status": "deploying",
            "config": config,
            "deployed_at": "2025-11-22T12:00:00Z" # Mock timestamp
        }
        self.active_honeypots[honeypot_id] = deployment_info
        
        # Simulate async deployment success
        deployment_info["status"] = "active"
        
        return deployment_info

    async def list_honeypots(self, agent_id: str = None) -> List[Dict[str, Any]]:
        if agent_id:
            return [h for h in self.active_honeypots.values() if h["agent_id"] == agent_id]
        return list(self.active_honeypots.values())

honeypot_manager = HoneypotManager()
