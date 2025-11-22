from .ip_rotator import IPRotator, MockIPRotator
from .port_shuffler import PortShuffler
from typing import Dict, Any

class MTDController:
    def __init__(self):
        self.ip_rotator: IPRotator = MockIPRotator()
        self.port_shuffler = PortShuffler()

    async def trigger_ip_rotation(self, agent_id: str) -> Dict[str, Any]:
        # In a real scenario, we would look up the agent's cloud instance ID
        instance_id = "i-1234567890abcdef0" 
        result = await self.ip_rotator.rotate_ip(instance_id)
        return {
            "agent_id": agent_id,
            "action": "ip_rotation",
            "details": result
        }

    async def trigger_port_shuffle(self, agent_id: str, service: str, old_port: int, new_port: int) -> Dict[str, Any]:
        result = await self.port_shuffler.shuffle_port(service, old_port, new_port)
        return {
            "agent_id": agent_id,
            "action": "port_shuffle",
            "details": result
        }

mtd_controller = MTDController()
