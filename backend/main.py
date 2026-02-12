import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# LangChain & Agent Imports
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate,MessagesPlaceholder
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain import hub



load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
tavily_key = os.getenv("TAVILY_API_KEY")

if not api_key:
    print("OPENAI_API_KEY not found")
if not tavily_key:
    print("TAVILY_API_KEY not found")

app = FastAPI()

# 2. My Frontend Connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. THe Input Data
class TaxData(BaseModel):
    income: float
    expenses: float
    tax_year: str = "2025"
    country: str
    marital_status:str

class ChatData(BaseModel):
    question: str = ''
    income: float
    expenses: float
    tax_year: str = "2025"
    country: str
    marital_status:str




llm = ChatOpenAI(model="gpt-4o", temperature=0.3,streaming=True)
#Tools for my agent, we will see at the end:
search_tool= TavilySearchResults(max_results=5, api_key=tavily_key) 
tool=[search_tool]

@app.post("/calculate-tax")
async def calculate_tax(data: TaxData):
    try: 
        if data.income > 0:
            net_profit = data.income - data.expenses
            profit_margin = round((net_profit / data.income) * 100, 1)
        else:
            profit_margin = 0
        
       
        prompt = ChatPromptTemplate.from_template(
        """
        You are a helpful tax assistant for a user from the country {country}.
        Answer to the user in the language of the country he lives in.

        The user has an annual income of {income}€ and expenses of {expenses}€.
        The user's net profit is {net_profit}€.
        The user's profit margin is {profit_margin}%.
        The user is {marital_status}.
        
        
        Please provide:
        1. A brief analysis of their financial situation based on user's country status. 
        2. Two tax-saving tips relevant to their situation and Country that he lives in.
        3. A disclaimer that you are an AI and this is not professional advice.
        4. Tell the user to ask in the chat below if they have any other tax-related questions or if they want more details on this topic.
        
        Format your response using Markdown:
        - Use **Bold** for key terms.
        - Use bullet points for the tips.
        - Keep the response concise (under 300 words).
        """)

        
        chain = prompt | llm


        async def return_stream():
            header_data={
                'income': data.income,
                'expenses' : data.expenses,
                'profit_margin': profit_margin,
                'net_profit': net_profit,
                'type': "data" }
            yield json.dumps(header_data) + "\n"

            
        
            message_1={
                "income": data.income, 
                "expenses": data.expenses,
                "marital_status": data.marital_status,
                "country": data.country,
                "net_profit": net_profit,
                "profit_margin": profit_margin}
            


            async for chunk in chain.astream(message_1):

                yield chunk.content
        return StreamingResponse(return_stream(), media_type="text/event-stream")
    
    except Exception as e:
        print(f"Error: {e}")
        return {
            'profit_margin': profit_margin,
            'net_profit': net_profit,
            "advice": "AI Service unavailable... Please try again later."
        }
#For my chat:
@app.post("/ask-question")
async def ask_question(data: ChatData):
    


    system_message = f"""
    You are an expert tax researcher for {data.country}.
    User Context: Income {data.income}€, Expenses {data.expenses}€, Status {data.marital_status}.
    
    If the user asks about current tax laws, rates, or specific deductions, USE THE SEARCH TOOL.
    Search for official goverment tax authority websites in {data.country} for the year {data.tax_year}. 
    Do not rely on outdated knowledge, search for the most recent information.
    Always provide sources for any tax information you give, especially if it involves numbers or specific rules.
    
    If the answer is simple math, just answer it.
    Always format your final answer in Markdown.
    Answer in the user's question language if he is not in English.
    At the end of the answer, ask the user if they want to know more or have another question. 
    For example, "Do you have any other tax-related questions?" or "Would you like more details on this topic?".

    """
    agent_prompt = ChatPromptTemplate.from_messages([
        ("system",system_message),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])




    agent= create_tool_calling_agent(llm=llm,tools=tool,prompt=agent_prompt)
    agent_executor= AgentExecutor(agent=agent, tools=tool, verbose=True)


    async def agent_stream():
        async for event in agent_executor.astream_events({"input": data.question},version="v1"):
            if event["event"] == "on_chat_model_stream":
                if "chunk" in event["data"] and event["data"]["chunk"].content:
                    yield event["data"]["chunk"].content

    return StreamingResponse(agent_stream(), media_type="text/event-stream")


 