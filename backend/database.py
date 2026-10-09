from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from config import MONGODB_URI

client = MongoClient(
    MONGODB_URI, serverSelectionTimeoutMS=5000  # 5 seconds timeout
)

try:
    client.admin.command('ping')
    print("✓ Database connection successful!")
    db = client["miniAIhub"]
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    print(f"✗ Failed to connect to MongoDB: {e}")
    db = None


# Collections

# Define collections only when db is available to avoid import-time errors
if db is not None:
    users_collection = db["users"]
    posts_collection = db["posts"]
    comments_collection = db["comments"]
    tools_collection = db["tools"]
    raw_news_collection = db["raw_news"]
    generated_articles_collection = db["generated_article"]
else:
    users_collection = None
    posts_collection = None
    comments_collection = None
    tools_collection = None
    raw_news_collection = None
    generated_articles_collection = None