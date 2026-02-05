import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import json



load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")


if not api_key:
    print("OPENAI_API_KEY not found")

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




llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.3,streaming=True)

@app.post("/calculate-tax")
async def calculate_tax(data: TaxData):
    try:
        
        taxable_income = data.income - data.expenses
        estimated_tax = taxable_income * 0.23 
        
       
        prompt = ChatPromptTemplate.from_template(
        """
        You are a helpful tax assistant for a user from the country {country}.

        The user has an annual income of {income}€ and expenses of {expenses}€.
        Their estimated taxable income is {taxable_income}€.
        The user is {marital_status}.
        
        Please provide:
        1. A brief analysis of their financial situation based on user's country status.
        2. Two tax-saving tips relevant to their situation.
        3. A disclaimer that you are an AI and this is not professional advice.
        
        Format your response using Markdown:
        - Use **Bold** for key terms.
        - Use bullet points for the tips.
        - Keep the response concise (under 250 words).
        """
    )

        
        chain = prompt | llm

        ##Iwant to test the streaming response first, so I will comment out the normal response for now


        """
        ai_response = chain.invoke({
            "income": data.income, 
            "expenses": data.expenses,
            "taxable_income": taxable_income
        })


        
        return {
            "taxable_income": taxable_income,
            "estimated_tax": estimated_tax,
            "advice": ai_response.content  }
        """


        async def return_stream():
            header_data={
                'income': data.income,
                'expenses' : data.expenses,
                'taxable_income': taxable_income,
                'estimated_tax': estimated_tax,
                'type': "data" }
            yield json.dumps(header_data) + "\n"

            # Αυτο το εχω για το chat που θελω
        
            message_1={
                "income": data.income, 
                "expenses": data.expenses,
                "marital_status": data.marital_status,
                "country": data.country,
                "taxable_income": taxable_income}
            


            async for chunk in chain.astream(message_1):

                yield chunk.content
        return StreamingResponse(return_stream(), media_type="text/event-stream")
    
    except Exception as e:
        print(f"Error: {e}")
        return {
            "taxable_income": taxable_income,
            "estimated_tax": estimated_tax,
            "advice": "AI Service unavailable. Please check your API key."
        }

@app.post("/ask-question")
async def ask_question(data: ChatData):

    prompt=ChatPromptTemplate.from_template(
        """
        You are a helpful tax assistant for a user from the country {country}. You give concise and clear answers to the user's tax-related questions based on their financial situation.
        The user has an annual income of {income}€ and expenses of {expenses}€.
        The user is {marital_status}.
        The user has a question: {question}
        Answer the user's question based on the provided context. If you don't know the answer, say you don't know. Be concise and clear in your response. 
        Max 300 words. Use Markdown formatting for clarity.
        """
    )

    message_2={"question": data.question, 
                "income": data.income, 
                "expenses": data.expenses,
                "marital_status": data.marital_status,
                "country": data.country}
    
    chain= prompt| llm 

    
    async def ask_question_stream():
        async for chunk in chain.astream(message_2):
            yield chunk.content
    return StreamingResponse(ask_question_stream(), media_type="text/event-stream")

    """
    output=await chain.ainvoke(message_2)
    return {"answer": output.content}
"""


 