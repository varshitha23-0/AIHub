import feedparser
import pandas as pd
import os
from pathlib import Path

RSS_FEEDS = [
    # Aggregator
    "https://planet-ai.net/rss.xml",

    # OpenAI
    "https://openai.com/news/rss.xml",

    # Google AI / Research
    "https://research.google/blog/rss/",

    # Tech News
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    "https://arstechnica.com/ai/feed/"
]



# Get the directory where this script is located
script_dir = Path(__file__).parent.parent
csv_path = script_dir / "data" / "ai_news.csv"
data = []

print("Fetching AI news...")

for rss_url in RSS_FEEDS:

    feed = feedparser.parse(rss_url)
    for article in feed.entries:
        title = article.get("title", "").strip()
        summary = article.get("summary", "").strip()
        link = article.get("link", "").strip()
        published = article.get("published", "").strip()
        source = article.get("source", {}).get("title", "")
        text = f"{title} {summary}"
        if not text.strip():
            continue
        data.append({
            "title": title,
            "summary": summary,
            "text": text,
            "source": source,
            "url": link,
            "published_at": published,
            "label": 1
        })

df = pd.DataFrame(data)
df["title_clean"] = (
    df["title"]
    .str.lower()
    .str.strip()
)

df.drop_duplicates(
    subset=["url"],
    inplace=True
)
df.drop_duplicates(
    subset=["title"],
    inplace=True
)
df = df[
    df["text"].str.len() > 80
]
df = df[
    df["summary"].str.len() > 20
]


df.to_csv(
    csv_path,
    index=False
)

print(f"Saved {len(df)} AI news articles")
print(f"File exists: {csv_path.exists()}")