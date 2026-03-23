# 🎯 Scope-AI: Architect Your AI Projects with Data-Backed Confidence

<div align="center">
  <img src="https://img.shields.io/github/stars/kikicaca44/scope-ai?style=for-the-badge&logo=github&color=gold" alt="GitHub Stars" />
  <img src="https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.x-05998b?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/shadcn/ui-v4-black?style=for-the-badge&logo=shadcnui" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License" />
</div>

<br />

**Stop guessing your AI infrastructure costs.**  
`Scope-AI` is a powerful **local web dashboard** designed for indie hackers and software architects. It transforms vague project ideas into structured technical blueprints, providing precise **token usage estimates** and **monthly cost projections** across 100+ LLM models.

---

## 🚫 The Problem: "The AI Bill Shock"

Building an AI-powered service is easier than ever, but **budgeting it is a nightmare**.  
- How many tokens will a 10-minute user session consume?
- Is GPT-4o overkill for a simple summarization task? 
- Will my project remain profitable at scale?

Most developers realize they're losing money **after** receiving their first API invoice. **Scope-AI fixes this.**

---

## ✨ Key Features

### 🔍 1. Intelligent Task Breakdown
Input a simple prompt like *"I want to build an AI code reviewer"*. Scope-AI's architect engine breaks it down into granular tasks: 
- Context Indexing
- Prompt Engineering
- Output Generation
- Metadata Analysis

### 💰 2. Real-time Cost Projection (Powered by LiteLLM)
No hard-coded prices. Scope-AI fetches the latest pricing for **OpenAI, Anthropic, Gemini, Mistral**, and more. It calculates costs per 1,000 sessions based on predicted token I/O.

### 📊 3. Interactive Data Visualization
Visualize your budget distribution with beautiful **Donut Charts** and interactive dashboards. Identify cost-heavy tasks at a glance.

### 🤖 4. Smart Model Recommendations
Get suggestions on which model provides the best "Value-to-Performance" ratio for each specific task in your project.

### 🔑 5. Privacy-First (BYOK)
`Scope-AI` runs entirely on your local machine. Your API keys and project ideas never leave your system. **Bring Your Own Key (BYOK)** and start planning for free.

---

## 🛠️ Technical Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui v4](https://ui.shadcn.com/), [Recharts](https://recharts.org/)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [LiteLLM](https://github.com/BerriAI/litellm) (Multi-model integration)
- **AI Logic**: Structured JSON outputs via GPT-4o-mini/Claude-3-Sonnet

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/kikicaca44/scope-ai.git
cd scope-ai
```

### 2. Run the one-click setup
We provide a simple script to launch both the frontend and backend simultaneously.
```bash
chmod +x run.sh
./run.sh
```

### 3. Open your browser
Navigate to `http://localhost:3000` and start architecting!

---

## 📖 How it Works: The Internal Logic

1. **Requirement Analysis**: Your prompt is sent to a specialized LLM "Architect" prompt.
2. **Structural Decomposition**: The Architect breaks the project into technical modules.
3. **Token Estimation**: Each module is assigned an estimated Input/Output token count based on industry benchmarks.
4. **Cost Calculation**: `LiteLLM` cross-references these tokens with real-time model pricing.
5. **Blueprint Generation**: A final JSON blueprint is rendered on your dashboard.

---

## 🗺️ Roadmap

- [x] **v0.1.0**: Core Web Dashboard & Token Estimation
- [x] **v0.2.0**: Export blueprints to `PDF` and `blueprint.yaml`
- [x] **v0.3.0**: Support for **Local LLMs** (Ollama, Llama.cpp)
- [x] **v0.4.0**: Local History & Blueprint Management
- [x] **v1.0.0**: Community-driven project templates

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by [Your Name] for the Global Builder Community.</p>
  <p><b>Economic Freedom through Open Source.</b></p>
</div>
