from dotenv import load_dotenv
import os

load_dotenv()

NEWSAPI_API_KEY = os.getenv(
    "NEWSAPI_API_KEY"
)

GNEWS_API_KEY = os.getenv(
    "GNEWS_API_KEY"
)

CURRENTS_API_KEY = os.getenv(
    "CURRENTS_API_KEY"
)
MONGODB_URI = os.getenv(
    "MONGODB_URI"
)
RSS_SOURCES = [

    {
        "name": "OpenAI",
        "url": os.getenv(
            "OPENAI_RSS"
        ),
        "category": "AI Research",
        "trust_score": 1.0
    },


    {
        "name": "Google DeepMind",
        "url": os.getenv(
            "DEEPMIND_RSS"
        ),
        "category": "AI Research",
        "trust_score": 1.0
    },


    {
        "name": "Google Research",
        "url": os.getenv(
            "GOOGLE_RESEARCH_RSS"
        ),
        "category": "Research",
        "trust_score": 1.0
    },


    {
        "name": "HuggingFace",
        "url": os.getenv(
            "HUGGINGFACE_RSS"
        ),
        "category": "Machine Learning",
        "trust_score": 0.95
    },


    {
        "name": "NVIDIA",
        "url": os.getenv(
            "NVIDIA_RSS"
        ),
        "category": "AI Hardware",
        "trust_score": 1.0
    },


    {
        "name": "MIT Technology Review AI",
        "url": os.getenv(
            "MIT_AI_RSS"
        ),
        "category": "AI News",
        "trust_score": 0.9
    },


    {
        "name": "TechCrunch AI",
        "url": os.getenv(
            "TECHCRUNCH_AI_RSS"
        ),
        "category": "AI Industry",
        "trust_score": 0.8
    },


    {
        "name": "VentureBeat AI",
        "url": os.getenv(
            "VENTUREBEAT_AI_RSS"
        ),
        "category": "AI Business",
        "trust_score": 0.8
    },


    {
        "name": "Hacker News",
        "url": os.getenv(
            "HACKERNEWS_RSS"
        ),
        "category": "Technology",
        "trust_score": 0.6
    },


    {
        "name": "arXiv AI",
        "url": os.getenv(
            "ARXIV_AI_RSS"
        ),
        "category": "Research Paper",
        "trust_score": 1.0
    },


    {
        "name": "arXiv Machine Learning",
        "url": os.getenv(
            "ARXIV_ML_RSS"
        ),
        "category": "Machine Learning",
        "trust_score": 1.0
    }

]