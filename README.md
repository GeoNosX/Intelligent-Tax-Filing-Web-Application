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

### **1. Clone the Repository**
```bash
git clone https://github.com/GeoNosX/Intelligent-Tax-Filing-Web-Application.git
cd Intelligent-Tax-Filing-Web-Application