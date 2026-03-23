import os
import json
import asyncio
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from litellm import acompletion, cost_per_token
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="Scope-AI Engine v2 (Multi-Agent)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models for Response Validation
class Task(BaseModel):
    id: int
    name: str
    description: str
    inputTokens: int
    outputTokens: int
    complexity: str
    cost: Optional[float] = 0.0

class BusinessMetrics(BaseModel):
    revenueModel: str
    targetPricing: float
    monthlyOperatingCost: float
    bepUsers: int
    margin: float

class TechStack(BaseModel):
    frontend: str
    backend: str
    database: str
    infrastructure: str

class SystemPrompts(BaseModel):
    architect: str
    techLead: str
    cfo: str

class AnalysisResult(BaseModel):
    projectName: str
    totalEstimatedCost: float
    tasks: List[Task]
    businessMetrics: BusinessMetrics
    techStack: TechStack
    systemPrompts: SystemPrompts
    modelUsed: str

# Input Request Model
class ProjectRequirement(BaseModel):
    prompt: str
    model: str = "gpt-4o-mini"
    base_url: Optional[str] = None

# System Prompts for Agents
ARCHITECT_PROMPT = """
You are an expert Software Architect. Analyze the user's project idea and break it down into technical tasks. 
For each task, estimate the input and output tokens required per session for an AI to perform that task.
Return ONLY a JSON object with this exact structure:
{
    "projectName": "Name",
    "tasks": [
        { "id": 1, "name": "Task Name", "description": "Short description", "inputTokens": 1000, "outputTokens": 500, "complexity": "Low/Medium/High" }
    ]
}
"""

TECH_LEAD_PROMPT = """
You are an expert Tech Lead. Analyze the user's project idea and recommend the best tech stack.
Also, provide draft system prompts for three roles (Architect, Tech Lead, CFO) that can be used to build this project.
Return ONLY a JSON object with this exact structure:
{
    "techStack": { "frontend": "Framework", "backend": "Framework", "database": "DB", "infrastructure": "Cloud/Host" },
    "systemPrompts": { "architect": "Prompt for Architect", "techLead": "Prompt for Tech Lead", "cfo": "Prompt for CFO" }
}
"""

CFO_PROMPT = """
You are an expert CFO for startups. Analyze the user's project idea for business viability. 
Suggest a revenue model, target pricing, estimated monthly operating cost, and calculate the number of users needed per month to break even (BEP).
Return ONLY a JSON object with this exact structure:
{
    "businessMetrics": { "revenueModel": "Subscription/Ads/etc", "targetPricing": 19.99, "monthlyOperatingCost": 500.0, "bepUsers": 25, "margin": 0.2 }
}
"""

async def call_agent(prompt: str, system_message: str, model: str, api_key: str, base_url: Optional[str] = None):
    kwargs = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "api_key": api_key if api_key else "dummy-key",
        "response_format": { "type": "json_object" }
    }
    if base_url:
        kwargs["api_base"] = base_url
    
    response = await acompletion(**kwargs)
    content = response.choices[0].message.content
    return json.loads(content)

@app.post("/analyze")
async def analyze_project(req: ProjectRequirement, authorization: Optional[str] = Header(None)):
    api_key = authorization.replace("Bearer ", "") if authorization else os.getenv("OPENAI_API_KEY", "")

    try:
        # Parallel execution using asyncio.gather for optimal performance
        architect_task = call_agent(req.prompt, ARCHITECT_PROMPT, req.model, api_key, req.base_url)
        tech_lead_task = call_agent(req.prompt, TECH_LEAD_PROMPT, req.model, api_key, req.base_url)
        cfo_task = call_agent(req.prompt, CFO_PROMPT, req.model, api_key, req.base_url)

        architect_res, tech_lead_res, cfo_res = await asyncio.gather(architect_task, tech_lead_task, cfo_task)

        # Merge results into a single blueprint
        blueprint = {
            "projectName": architect_res.get("projectName", "Untitled Project"),
            "tasks": architect_res.get("tasks", []),
            "techStack": tech_lead_res.get("techStack", {}),
            "systemPrompts": tech_lead_res.get("systemPrompts", {}),
            "businessMetrics": cfo_res.get("businessMetrics", {}),
            "modelUsed": req.model
        }

        # Cost calculation for each task based on LiteLLM cost data
        total_cost = 0
        try:
            input_price, output_price = cost_per_token(model=req.model)
        except Exception:
            input_price, output_price = 0.0, 0.0

        for task in blueprint["tasks"]:
            i_tokens = task.get("inputTokens", 0)
            o_tokens = task.get("outputTokens", 0)
            task_cost = ((i_tokens * input_price) + (o_tokens * output_price)) / 1_000_000
            task["cost"] = round(task_cost, 4)
            total_cost += task_cost

        blueprint["totalEstimatedCost"] = round(total_cost, 4)

        # Validate with Pydantic model to ensure consistency
        validated_result = AnalysisResult(**blueprint)
        return validated_result

    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
