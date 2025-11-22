from abc import ABC, abstractmethod
from typing import Dict, Any

class IPRotator(ABC):
    @abstractmethod
    async def rotate_ip(self, instance_id: str) -> Dict[str, Any]:
        """Rotates the IP address for a given instance."""
        pass

    @abstractmethod
    async def get_current_ip(self, instance_id: str) -> str:
        """Returns the current public IP of the instance."""
        pass

class AWSIPRotator(IPRotator):
    async def rotate_ip(self, instance_id: str) -> Dict[str, Any]:
        # TODO: Implement boto3 logic to:
        # 1. Allocate new Elastic IP
        # 2. Associate with instance
        # 3. Release old Elastic IP
        return {"status": "success", "new_ip": "1.2.3.4", "provider": "aws"}

    async def get_current_ip(self, instance_id: str) -> str:
        return "1.2.3.4"

class MockIPRotator(IPRotator):
    async def rotate_ip(self, instance_id: str) -> Dict[str, Any]:
        import random
        new_ip = f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}"
        return {"status": "success", "new_ip": new_ip, "provider": "mock"}

    async def get_current_ip(self, instance_id: str) -> str:
        return "127.0.0.1"
