




import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import requests
from bs4 import BeautifulSoup
import httpx
import ssl
import socket
from datetime import datetime
import asyncio
import random
import time
from urllib.parse import urlparse, urljoin
from agents import function_tool, Runner, Agent, set_default_openai_api, set_tracing_disabled, AsyncOpenAI, set_default_openai_client, AgentHooks
from mangum import Mangum
from dotenv import load_dotenv
load_dotenv()
# Initialize the FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the request model
class ChatRequest(BaseModel):
    message: str

# --------------------------------------------------------------------
# ALL YOUR TOOL FUNCTIONS GO HERE
# --------------------------------------------------------------------
# (The code for all your tool functions like scrap_full_text, scrap_headings, etc., should be here)
# ...
@function_tool
async def scrap_full_text(site: str) -> dict:
    # ... your scrap_full_text function code ...
    pass
# ... (all your other tool functions) ...
# --------------------------------------------------------------------

# --------------------------------------------------------------------
# AGENT AND CLIENT CONFIGURATION
# --------------------------------------------------------------------
api_key = os.environ.get("GEMINI_API_KEY") 
MODEL = 'gemini-2.0-flash'

client = AsyncOpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=api_key
)

#Global Config
set_default_openai_api('chat_completions')
set_default_openai_client(client=client)
set_tracing_disabled(True)

class Agenthook(AgentHooks):
    async def on_start(self, context, agent):
        print("performance start")
        return await super().on_start(context, agent)

agent = Agent(
    name="SEO Agent",
    instructions="""
    ## System Prompt
    You are an **SEO Content Analyzer Agent**.
    ... (rest of your agent instructions here) ...
    """,
    model=MODEL,
    tools=[
        scrap_full_text,
        scrap_headings,
        scrap_meta,
        scrap_og_and_verification,
        check_site_protocol_ssl,
        scrap_images,
        get_all_pages_classified
    ]
)

# --------------------------------------------------------------------
# THE CORRECT FASTAPI ENDPOINT
# --------------------------------------------------------------------
@app.post("/api/chat")
async def chat_with_agent(request: ChatRequest):
    """
    This endpoint receives a message from the frontend, runs the agent,
    and returns the agent's final response.
    """
    print(f"Received message: {request.message}")

    try:
        # CORRECT: Create a new history for each request.
        history = [{"role": "user", "content": request.message}]
        
        result = await Runner.run(agent, input=history)
        
        # You can add the agent's reply to the history here if needed for follow-up questions
        # history.append({"role": "assistant", "content": result.final_output})
        
        return {"reply": result.final_output}
    except Exception as e:
        print(f"An error occurred: {e}")
        # Return a more descriptive error for debugging
        return {"reply": f"An unexpected error occurred: {e}"}

# The handler that Vercel needs to run your application
handler = Mangum(app)