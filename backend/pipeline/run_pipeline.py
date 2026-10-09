import os

os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
from pipeline.collect_news import collect_news
from pipeline.cluster_news import run_clustering
from pipeline.process_article import process_clusters


def run_pipeline():

    print("Starting Pipeline...")

    print("Step 1: Collecting News")
    collect_news()

    print("Step 2: Clustering News")
    run_clustering()

    print("Step 3: Generating Articles")
    process_clusters()

    print("Pipeline Completed Successfully!")


if __name__ == "__main__":
    run_pipeline()