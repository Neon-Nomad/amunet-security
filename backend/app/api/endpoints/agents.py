from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ...database import get_db
from ...models import Agent
from ...schemas import AgentCreate, AgentResponse

router = APIRouter()

@router.post("/register", response_model=AgentResponse)
async def register_agent(agent: AgentCreate, db: AsyncSession = Depends(get_db)):
    # Check if agent with hostname already exists (simple logic for MVP)
    result = await db.execute(select(Agent).where(Agent.hostname == agent.hostname))
    existing_agent = result.scalars().first()
    
    if existing_agent:
        # Update existing agent
        existing_agent.ip_address = agent.ip_address
        existing_agent.os_type = agent.os_type
        existing_agent.status = "online"
        await db.commit()
        await db.refresh(existing_agent)
        return existing_agent
    
    # Create new agent
    new_agent = Agent(**agent.model_dump())
    new_agent.status = "online"
    db.add(new_agent)
    await db.commit()
    await db.refresh(new_agent)
    return new_agent

@router.get("/", response_model=List[AgentResponse])
async def list_agents(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agent).offset(skip).limit(limit))
    agents = result.scalars().all()
    return agents
