# 🏦 Intelligent Tax Filing AI Assistant

A full-stack web application that simplifies tax filing by combining **real-time tax calculations** with an **AI-powered financial advisor**. 

The system uses **OpenAI GPT-4o** and **Tavily Search** to provide up-to-date tax advice based on the latest 2025/2026 regulations.

---

## 🚀 Features

- **📊 Smart Tax Calculator:** Instantly calculates taxable income and estimated tax liability based on income and expenses.
- **🤖 AI Tax Agent:** A "ReAct" agent that answers complex tax questions by searching the live internet for current laws.
- **⚡ Real-Time Streaming:** AI responses are streamed character-by-character for a fluid user experience.
- **🐳 Dockerized:** Fully containerized architecture (Frontend + Backend) for one-command deployment.
- **✅ CI/CD Pipeline:** Automated testing via GitHub Actions ensures code stability on every push.

---

## 🛠️ Tech Stack

### **Frontend**
- **React (Vite):** Fast, modern UI framework.
- **Tailwind CSS:** Responsive styling.
- **Axios:** API communication.

### **Backend**
- **FastAPI (Python):** High-performance async API.
- **LangChain:** Orchestrates the AI logic and tools.
- **OpenAI GPT-4o:** The brain behind the reasoning.
- **Tavily API:** The search engine for real-time tax laws.

### **DevOps**
- **Docker & Docker Compose:** Containerization.
- **GitHub Actions:** CI/CD for automated testing.

---

## ⚙️ Installation & Setup

### **Prerequisites**
- Docker Desktop (Running)
- Git
### **1. Configure Environment Variables**
* Navigate to the backend folder.

* Create a file named .env.

* Add your keys: 

OPENAI_API_KEY=sk-proj-....

TAVILY_API_KEY=tvly-....

### **2. Run with Docker (Recommended)**
Run the entire application (Frontend + Backend) with a single command:
docker compose up --build

* Frontend: Open http://localhost:5173

* Backend API Docs: Open http://localhost:8000/docs

### **3. CI/CD Pipeline** 

This project includes a GitHub Actions workflow (.github/workflows/ci_pipeline.yml) that runs automatically whenever code is pushed to the main branch
 #### What it does:  

* Sets up a Python 3.10 environment.

* Installs backend dependencies.

* Runs pytest to verify the API endpoints are functioning correctly.

### **4. Project Structure**

├── backend/

│   ├── main.py 

│   ├── Dockerfile  

│   ├── requirements.txt  

│   └── test_main.py 

│

├── frontend/

│   ├── src/    

│   ├── Dockerfile  

│   └── package.json   

│

├── .github/workflows/

│   └── ci_pipeline.yml  

│

├── docker-compose.yml   

└── README.md

### **5. Author:**
George Kourelas 
### **6. Clone the Repository**
```bash
git clone https://github.com/GeoNosX/Intelligent-Tax-Filing-Web-Application.git
cd Intelligent-Tax-Filing-Web-Application




