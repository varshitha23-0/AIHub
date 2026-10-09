from bson import ObjectId

from database import generated_articles_collection


def serialize_article(article):

    return {
        "_id": str(article["_id"]),
        "topic": article.get("topic"),
        "article": article.get("article"),
        # compatibility aliases for frontend
        "title": article.get("topic"),
        "content": article.get("article"),
        "generated_at": article.get("published_at"),
        "source_count": len(article.get("sources", [])),
        "summary": article.get("summary"),
        "keywords": article.get("keywords", []),
        "sources": article.get("sources", []),
        "source_articles": article.get("source_articles", []),
        "published_at": article.get("published_at")
    }


def get_all_news(keyword=None):
    # If no keyword provided, return all articles sorted by published_at
    if not keyword:
        articles = list(
            generated_articles_collection.find()
            .sort("published_at", -1)
        )

        return [
            serialize_article(article)
            for article in articles
        ]

    # Build case-insensitive regex search when keyword is provided
    q = {
        "$or": [
            {"topic": {"$regex": keyword, "$options": "i"}},
            {"keywords": {"$regex": keyword, "$options": "i"}}
        ]
    }

    articles = list(
        generated_articles_collection.find(q)
        .sort("published_at", -1)
    )

    return [serialize_article(article) for article in articles]


def get_news_by_id(id):

    article = generated_articles_collection.find_one(
        {
            "_id": ObjectId(id)
        }
    )

    if not article:
        return {
            "message": "Article not found"
        }

    return serialize_article(article)


def create_news(article):

    result = generated_articles_collection.insert_one(
        article
    )

    return {
        "message": "Article added successfully",
        "article_id": str(result.inserted_id)
    }


def update_news(id, article):

    generated_articles_collection.update_one(
        {
            "_id": ObjectId(id)
        },
        {
            "$set": article
        }
    )

    return {
        "message": "Article updated successfully"
    }


def delete_news(id):

    generated_articles_collection.delete_one(
        {
            "_id": ObjectId(id)
        }
    )

    return {
        "message": "Article deleted successfully"
    }