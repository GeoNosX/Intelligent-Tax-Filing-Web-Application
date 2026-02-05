from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 1. Enable CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Define the data structure

class TaxData(BaseModel):
    income: float
    expenses: float

# 3. Create the API Endpoint

@app.post("/calculate-tax")
async def calculate_tax(data: TaxData):
    # Logic: Basic calculation for Phase 2
    taxable_income = data.income - data.expenses
    estimated_tax = taxable_income * 0.23 
    
    return {
        "message": "Calculation successful",
        "taxable_income": taxable_income,
        "estimated_tax": estimated_tax,
        "advice": "This is a placeholder for AI advice."
    }

# 4. Root endpoint to check if server is running
@app.get("/")
def read_root():
    return {"status": "Server is running"}