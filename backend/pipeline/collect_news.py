from datetime import datetime
import os
import sys


# ==========================================
# PROJECT ROOT
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)


sys.path.append(BASE_DIR)



from services.news_fetcher import fetch_all_news

from services.bert_services import (
    classify_news_batch
)

from database import (
    raw_news_collection
)



# ==========================================
# COLLECT AI NEWS
# ==========================================

def collect_news():

    print("Fetching articles...")


    articles = fetch_all_news()


    print(
        f"Fetched {len(articles)} articles"
    )


    if not articles:

        print(
            "No articles found"
        )

        return



    # ======================================
    # BERT CLASSIFICATION (BATCH)
    # ======================================

    print(
        "Running BERT classification..."
    )


    predictions = classify_news_batch(
        articles
    )


    print(
        "Classification complete"
    )



    inserted_count = 0



    # ======================================
    # STORE AI ARTICLES
    # ======================================

    for article, prediction in zip(
        articles,
        predictions
    ):


        try:


            # Keep only AI related news

            if prediction != 1:

                continue



            # Duplicate check

            existing = raw_news_collection.find_one(
                {
                    "url": article.get("url")
                }
            )
            #Key word filtering
            AI_KEYWORDS = {

                "ai",
                "artificial intelligence",
                "machine learning",
                "deep learning",
                "llm",
                "gpt",
                "chatgpt",
                "openai",
                "gemini",
                "claude",
                "anthropic",
                "copilot",
                "mistral",
                "huggingface",
                "hugging face",
                "transformer",
                "bert",
                "neural",
                "generative ai",
                "computer vision",
                "nlp",
                "large language model",
                "diffusion",
                "stable diffusion",
                "midjourney",
                "dall-e",
                "xai",
                "deepmind",
                "ai model"

            }
            # ==========================================

            def is_ai_article(article):

                title = article.get("title", "").lower()

                description = article.get("description", "").lower()

                url = article.get("url", "").lower()

                text = f"{title} {description} {url}"

                score = 0
                for keyword in AI_KEYWORDS:
                    if keyword in text:
                        score += 1
                return score >= 3
            if not is_ai_article(article):

                continue

            if existing:

                continue



            # Add pipeline fields

            article["bert_label"] = 1

            article["clustered"] = False

            article["processed"] = False

            article["created_at"] = datetime.utcnow()



            raw_news_collection.insert_one(
                article
            )


            inserted_count += 1



        except Exception as e:


            print(
                f"Error storing article: {e}"
            )



    print(
        f"Stored {inserted_count} AI articles"
    )




# ==========================================
# RUN
# ==========================================

if __name__ == "__main__":

    collect_news()