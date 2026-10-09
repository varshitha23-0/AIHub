from services.clusterdb import get_clusters_from_db
from services.article_generator import generate_article
from services.summarizer_services import generate_summary
from database import generated_articles_collection

print("I am in this file")
def process_clusters():
    print("PROCESS CLUSTERS STARTED")

    clusters = get_clusters_from_db()
    print(len(clusters))

    saved_articles = []

    for cluster_id, articles in clusters.items():

        if not articles:
            continue

        descriptions = [a.get("description", "") for a in articles]
        content = [a.get("full_content", "") for a in articles]
        # ======================================
        # STEP 1: Combine text for summarizer
        # ======================================
        combined_text = " ".join([
            " ".join(descriptions),
            " ".join(content)
        ]).strip()

        # ======================================
        # STEP 2: REAL PEGASUS SUMMARY
        # ======================================
        summary = generate_summary(combined_text)

        # ======================================
        # STEP 3: GENERATE ARTICLE
        # ======================================
        article = generate_article(
            title=f"Cluster {cluster_id}",
            summary=summary,
            articles=articles
        )

        # ======================================
        # STEP 4: STORE IN MONGODB
        # ======================================
        generated_articles_collection.insert_one(article)

        saved_articles.append(article)
        print(len(saved_articles))

    return saved_articles
if __name__ == "__main__":

    process_clusters()