# AI Hub 📰🤖

AI Hub is a full-stack application I built to bring AI-related news, generated articles, AI tools, and community posts together in one place.

The project combines a React frontend with a FastAPI backend and MongoDB. I also worked with NLP models to filter relevant news, group similar articles, and generate summaries.

## ✨ Features

- Collects AI news from news APIs and RSS feeds.
- Uses a fine-tuned BERT model to identify AI-related news.
- Uses Sentence Transformers to find similar articles and group them together.
- Uses PEGASUS to generate concise summaries.
- Includes sections for news, generated articles, AI tools, and community posts.
- Stores application data in MongoDB.
- Provides REST APIs through FastAPI.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, JavaScript, Axios
- **Backend:** Python, FastAPI
- **Database:** MongoDB, PyMongo
- **AI/ML:** BERT, Sentence Transformers, PEGASUS, scikit-learn
- **Tools:** Git, GitHub

## 📁 Project Structure

```text
AI-Hub/
├── backend/
│   ├── app.py
│   ├── .env.example
│   ├── routes/
│   ├── services/
│   ├── pipeline/
│   ├── schemas/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── models/
│   ├── bert_ai_news/
│   ├── pegasus/
│   └── sentence_transformer/
├── .gitattributes
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

- Python 3.10 or newer
- Node.js 20.19+, 22.13+, or 24+ and npm (supported by the frontend toolchain)
- MongoDB
- Git and Git LFS for the BERT model weights

### 1. Clone the repository

```bash
git lfs install
git clone <your-repository-url>
cd <repository-folder>
git lfs pull
```

### 2. Set up the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and add your MongoDB connection string and provider API
keys. In particular, set `GNEWS_API_KEY` to a key from your GNews account
dashboard to enable GNews. Do not share or commit this file. The GNews
integration requests 10 articles per call, which is compatible with the free
plan limit.

Start the backend:

```bash
python -m uvicorn app:app --reload --port 8000
```

API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Set up the frontend

Open another terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧠 How the News Pipeline Works

1. News is collected from configured APIs and RSS feeds.
2. BERT filters news based on its relevance to AI.
3. Sentence Transformers generates embeddings to group similar articles.
4. PEGASUS generates summaries for the collected content.
5. The processed data is stored in MongoDB and used by the application.

## 📦 Model Files

The project uses locally loaded model files for news classification, article embeddings, and summarization.

- The fine-tuned BERT model weights are stored using Git LFS.
- The Sentence Transformers model files are included in the repository.
- The PEGASUS model weights are not included because of their large size. They must be obtained separately and placed at `models/pegasus/model.safetensors` before running the summarization pipeline.

The application requires the appropriate model files, a working MongoDB connection, and access to the configured news sources for the complete pipeline to work.

## 🔍 Checks

To check the backend Python files:

```bash
python -m compileall -q .
```

To check the frontend:

```bash
npm run lint
npm run build
```

Run these commands from their respective project directories.

## 🚀 What I'm Learning Through This Project

Building AI Hub has helped me explore how NLP models can be integrated into a full-stack application, from collecting and processing data to presenting useful information through a web interface.

I'm continuing to improve the project, its reliability, and the way its different components work together.