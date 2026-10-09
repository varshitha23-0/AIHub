import sys
import os

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.append(BASE_DIR)

from database import (
    raw_news_collection
)

from services.clustering_services import (
    cluster_articles
)


def run_clustering():

    articles = list(
       raw_news_collection.find({
            "clustered": {"$ne": True}
})
    )

    if len(articles) < 2:

        print(
            "Not enough articles to cluster"
        )

        return

    print(
        f"Found {len(articles)} articles"
    )

    labels = cluster_articles(
    articles
)

    for article, label in zip(
        articles,
        labels
        ):

        if label == -1:
            raw_news_collection.update_one(
                {
                    "_id": article["_id"]
                },
                {
                    "$set": {
                        "cluster_id": -1,
                        "clustered": True,
                        "processed": True
                    }
                }
            )
            continue

        raw_news_collection.update_one(
            {
                "_id": article["_id"]
            },
            {
                "$set": {
                    "cluster_id": int(label),
                    "clustered": True
                }
            }
        )

    print(
        "Clustering complete"
    )


if __name__ == "__main__":

    run_clustering()