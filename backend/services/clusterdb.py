from database import raw_news_collection


def get_clusters_from_db():

    articles = list(
        raw_news_collection.find(
            {
                "bert_label": 1,
                "clustered": True,
                "processed": False,
                "cluster_id": {
                    "$ne": -1
                }
            }
        )
    )

    clusters = {}

    for article in articles:

        cluster_id = article.get("cluster_id")

        if cluster_id is None:
            continue

        if cluster_id not in clusters:

            clusters[cluster_id] = []

        clusters[cluster_id].append(article)

    print(f"Found {len(clusters)} clusters ready for article generation.")

    return clusters
if __name__ == "__main__":

    clusters = get_clusters_from_db()
    print(f"Found {len(clusters)} clusters ready for article generation.")