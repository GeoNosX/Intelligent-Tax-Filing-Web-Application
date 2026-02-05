import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


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


llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)

@app.post("/calculate-tax")
async def calculate_tax(data: TaxData):
    try:
        
        taxable_income = data.income - data.expenses
        estimated_tax = taxable_income * 0.23  
        
       
        prompt = ChatPromptTemplate.from_template(
        """
        You are a helpful tax assistant. 
        The user has an annual income of ${income} and expenses of ${expenses}.
        Their estimated taxable income is ${taxable_income}.
        
        Please provide:
        1. A brief analysis of their financial situation.
        2. Two tax-saving tips relevant to their situation.
        3. A disclaimer that you are an AI and this is not professional advice.
        
        Format your response using Markdown:
        - Use **Bold** for key terms.
        - Use bullet points for the tips.
        - Keep the response concise (under 150 words).
        """
    )

        
        chain = prompt | llm
        ai_response = chain.invoke({
            "income": data.income, 
            "expenses": data.expenses,
            "taxable_income": taxable_income
        })

        
        return {
            "taxable_income": taxable_income,
            "estimated_tax": estimated_tax,
            "advice": ai_response.content  }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "taxable_income": taxable_income,
            "estimated_tax": estimated_tax,
            "advice": "AI Service unavailable. Please check your API key."
        }