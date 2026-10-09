from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering
from collections import Counter
import numpy as np
import sys
import os

# ==========================================
# PROJECT ROOT
# ==========================================

parent_dir = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

sys.path.append(parent_dir)

# ==========================================
# LOAD LOCAL SENTENCE TRANSFORMER
# ==========================================

MODEL_PATH = os.path.join(
    parent_dir,
    "models",
    "sentence_transformer"
)

model = None


def load_model():

    global model

    if model is None:

        print("Loading Sentence Transformer...")

        model = SentenceTransformer(
            MODEL_PATH
        )

        print("Sentence Transformer Loaded")


# ==========================================
# BUILD TEXT
# ==========================================

def build_text(article):

    return " ".join([
        article.get("title", ""),
        article.get("description", ""),
        article.get("content", "")
    ]).strip()


# ==========================================
# CLUSTER ARTICLES
# ==========================================

def cluster_articles(articles):

    load_model()

    if len(articles) == 0:
        return []

    texts = [
        build_text(article)
        for article in articles
    ]

    embeddings = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    # ------------------------------------
    # Agglomerative Clustering
    # ------------------------------------

    clustering = AgglomerativeClustering(
        n_clusters=None,
        metric="cosine",
        linkage="average",
        distance_threshold=0.35
    )

    labels = clustering.fit_predict(embeddings)

    # ------------------------------------
    # Diagnostics
    # ------------------------------------

    counts = Counter(labels)

    print("\n========== CLUSTER REPORT ==========")

    for cluster_id, count in sorted(counts.items()):

        print(f"Cluster {cluster_id}: {count} articles")

    print("====================================\n")

    return labels


# ==========================================
# TEST
# ==========================================

if __name__ == "__main__":

    sample = [
        {
            "title": "OpenAI launches GPT-5",
            "description": "OpenAI released GPT-5",
            "content": "New multimodal model..."
        },
        {
            "title": "GPT-5 introduced",
            "description": "OpenAI announces GPT-5",
            "content": "Latest AI model..."
        },
        {
            "title": "Google releases Gemini",
            "description": "Gemini update",
            "content": "Google AI news..."
        }
    ]

    labels = cluster_articles(sample)

    print(labels)