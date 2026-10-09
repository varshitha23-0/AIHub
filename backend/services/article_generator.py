from datetime import datetime


def generate_article(title, summary, articles):

    key_points = []
    sources = set()
    source_articles = []

    for article in articles:

        if article.get("source"):
            sources.add(article["source"])

        source_articles.append({
            "title": article.get("title", "Untitled source article"),
            "source": article.get("source", "Unknown source"),
            "description": article.get("description", ""),
            "url": article.get("url"),
            "published_at": article.get("published_at") or article.get("publishedAt")
        })

        if article.get("description"):
            key_points.append(article["description"])

    key_points = list(dict.fromkeys(key_points))[:8]

    technical_section = ""

    for point in key_points:
        technical_section += f"• {point}\n"

    source_text = ", ".join(sorted(sources))

    article_content = f"""
# {title}

## Overview
{summary}

## Key Developments
{technical_section}

## Technical Explanation
This article summarizes AI-related developments from multiple sources.

## Why This Matters
AI is impacting industries globally.

## Sources Covered
{source_text}

Total Articles: {len(articles)}

## Generated At
{datetime.utcnow()}
"""

    return {
        "title": title,
        "summary": summary,
        "content": article_content,
        "source_count": len(articles),
        "sources": list(sources),
        "source_articles": source_articles,
        "generated_at": str(datetime.utcnow())
    }