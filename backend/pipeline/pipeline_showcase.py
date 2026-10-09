"""
Pipeline Showcase
-----------------
WebSocket wrapper around the existing project pipeline.

IMPORTANT:
This file does NOT replace the existing pipeline logic.
It only streams the intermediate results to the React frontend.

Existing pipeline modules:
    pipeline.collect_news
    pipeline.cluster_news
    pipeline.process_article
"""

import asyncio
import json
import logging
import traceback
from datetime import datetime, timezone
from typing import Any, Dict

import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sklearn.decomposition import PCA
from scipy.cluster.hierarchy import linkage

# ============================================================
# EXISTING PROJECT PIPELINE
# ============================================================

from pipeline.collect_news import collect_news
from pipeline.cluster_news import run_clustering
from pipeline.process_article import process_clusters


router = APIRouter(
    prefix="/pipeline",
    tags=["Pipeline Showcase"]
)

logger = logging.getLogger("pipeline.showcase")


# ============================================================
# HELPER
# ============================================================

async def send_stage(
    ws: WebSocket,
    stage: str,
    status: str,
    data: Dict[str, Any] | None = None
):
    """
    Send pipeline stage information to the React frontend.
    """

    event = {
        "stage": stage,
        "status": status,
        "data": data or {}
    }

    # Keep the terminal trace identical to the event stream consumed by the UI.
    timestamp = datetime.now(timezone.utc).strftime("%H:%M:%S")
    logger.info(
        "[PIPELINE %s] %s/%s %s",
        timestamp,
        stage.upper(),
        status.upper(),
        json.dumps(event["data"], default=str, separators=(",", ":")),
    )
    await ws.send_json(event)


# ============================================================
# PCA VISUALIZATION
# ============================================================

def project_2d(vectors):
    """
    Reduce real embedding vectors to 2D for visualization only.

    This does NOT affect actual clustering.
    """

    vectors = np.asarray(vectors, dtype=float)

    # No vectors
    if len(vectors) == 0:
        return []

    # One vector
    if len(vectors) == 1:
        return [
            {
                "x": 0.0,
                "y": 0.0
            }
        ]

    # Make sure vectors are 2-dimensional
    if vectors.ndim == 1:
        vectors = vectors.reshape(1, -1)

    # Replace NaN / infinity values
    if not np.isfinite(vectors).all():

        vectors = np.nan_to_num(
            vectors,
            nan=0.0,
            posinf=0.0,
            neginf=0.0
        )

    # Check whether every feature has zero variance.
    #
    # PCA cannot calculate explained variance when
    # all input vectors are identical.
    feature_variance = np.var(
        vectors,
        axis=0
    )

    if np.allclose(feature_variance, 0):

        return [
            {
                "x": 0.0,
                "y": 0.0
            }
            for _ in range(len(vectors))
        ]

    # Number of PCA components
    n_components = min(
        2,
        vectors.shape[1],
        len(vectors)
    )

    try:

        pca = PCA(
            n_components=n_components
        )

        coordinates = pca.fit_transform(vectors)

    except Exception:

        # Safe fallback for visualization
        return [
            {
                "x": 0.0,
                "y": 0.0
            }
            for _ in range(len(vectors))
        ]

    # If PCA produced only one dimension,
    # add a second zero dimension.
    if coordinates.shape[1] == 1:

        coordinates = np.hstack([
            coordinates,
            np.zeros(
                (coordinates.shape[0], 1)
            )
        ])

    return [
        {
            "x": float(point[0]),
            "y": float(point[1])
        }
        for point in coordinates
    ]


# ============================================================
# DENDROGRAM
# ============================================================

def build_dendrogram(vectors, labels):
    """
    Dendrogram used only for frontend visualization.

    The actual cluster assignments still come from
    run_clustering().
    """

    vectors = np.asarray(
        vectors,
        dtype=float
    )

    # Fewer than 2 articles
    if len(vectors) < 2:

        return {
            "labels": labels,
            "merges": []
        }

    # Make sure vectors are 2-dimensional
    if vectors.ndim == 1:
        vectors = vectors.reshape(1, -1)

    # Replace invalid values
    if not np.isfinite(vectors).all():

        vectors = np.nan_to_num(
            vectors,
            nan=0.0,
            posinf=0.0,
            neginf=0.0
        )

    # If all vectors are identical,
    # hierarchical clustering with cosine distance
    # may become invalid.
    if np.allclose(
        np.var(vectors, axis=0),
        0
    ):

        return {
            "labels": labels,
            "merges": []
        }

    try:

        z = linkage(
            vectors,
            method="average",
            metric="cosine"
        )

    except Exception:

        return {
            "labels": labels,
            "merges": []
        }

    merges = []

    for row in z:

        merges.append({
            "a": int(row[0]),
            "b": int(row[1]),
            "distance": float(row[2])
        })

    return {
        "labels": labels,
        "merges": merges
    }


# ============================================================
# WEBSOCKET
# ============================================================

@router.websocket("/showcase/ws")
async def pipeline_showcase_ws(
    ws: WebSocket
):

    await ws.accept()
    run_started = datetime.now(timezone.utc)
    logger.info("[PIPELINE] Showcase client connected")

    try:

        # ====================================================
        # RECEIVE DATA FROM FRONTEND
        # ====================================================

        payload = await ws.receive_json()

        articles = payload.get(
            "articles",
            []
        )

        logger.info(
            "[PIPELINE] Starting showcase with %d selected article(s): %s",
            len(articles),
            ", ".join(str(article.get("title", "Untitled"))[:80] for article in articles),
        )

        # ----------------------------------------------------
        # Minimum article requirement
        # ----------------------------------------------------

        if len(articles) < 3:

            logger.warning("[PIPELINE] Rejected run: fewer than 3 articles selected")

            await send_stage(
                ws,
                "error",
                "error",
                {
                    "message": (
                        "Please select at least 3 articles."
                    )
                }
            )

            await ws.close()

            return

        # ====================================================
        # 1. COLLECTION
        # ====================================================

        await send_stage(
            ws,
            "collection",
            "processing"
        )

        # Articles are already selected by the frontend.
        # Therefore this showcase treats them as collected input.

        await asyncio.sleep(0.2)

        await send_stage(
            ws,
            "collection",
            "completed",
            {
                "collected": len(articles)
            }
        )

        # ====================================================
        # 2. NORMALIZATION
        # ====================================================

        await send_stage(
            ws,
            "normalization",
            "processing"
        )

        normalized_articles = []

        for article in articles:

            normalized = {
                "id": article.get("id"),
                "source": article.get(
                    "source",
                    ""
                ),
                "title": article.get(
                    "title",
                    ""
                ),
                "description": article.get(
                    "description",
                    ""
                ),
                "url": article.get(
                    "url",
                    ""
                ),

                # IMPORTANT:
                # Preserve BERT label
                "bert_label": article.get(
                    "bert_label",
                    1
                ),

                # IMPORTANT:
                # Preserve existing embedding
                "embedding": article.get(
                    "embedding"
                )
            }

            normalized_articles.append(
                normalized
            )

        await send_stage(
            ws,
            "normalization",
            "completed",
            {
                "normalized": len(
                    normalized_articles
                )
            }
        )

        # ====================================================
        # 3. BERT CLASSIFICATION
        # ====================================================

        await send_stage(
            ws,
            "bert",
            "processing"
        )

        await asyncio.sleep(0.2)

        # Use existing article metadata when available.
        #
        # Existing MongoDB records use bert_label.
        # Showcase input can also provide bert_label.
        ai_articles = []

        for article in normalized_articles:

            label = article.get(
                "bert_label",
                1
            )

            # Handle both integer and string labels
            if (
                label == 1
                or label == "1"
                or label is True
            ):

                ai_articles.append(
                    article
                )

        rejected = (
            len(normalized_articles)
            - len(ai_articles)
        )

        await send_stage(
            ws,
            "bert",
            "completed",
            {
                "ai_relevant": len(
                    ai_articles
                ),
                "rejected": rejected
            }
        )

        # ----------------------------------------------------
        # Stop if no AI-relevant articles
        # ----------------------------------------------------

        if len(ai_articles) == 0:

            logger.warning("[PIPELINE] No AI-relevant articles remained after BERT classification")

            await send_stage(
                ws,
                "extraction",
                "completed",
                {
                    "extracted": 0
                }
            )

            await send_stage(
                ws,
                "embedding",
                "completed",
                {
                    "embeddings": 0,
                    "points": []
                }
            )

            await send_stage(
                ws,
                "clustering",
                "completed",
                {
                    "clusters": 0,
                    "cluster_details": []
                }
            )

            await ws.close()

            return

        # ====================================================
        # 4. ARTICLE EXTRACTION
        # ====================================================

        await send_stage(
            ws,
            "extraction",
            "processing"
        )

        await asyncio.sleep(0.2)

        # Full article extraction is already part of
        # the existing project pipeline.
        #
        # For manually selected showcase articles,
        # preserve the available fields.

        extracted_articles = ai_articles

        await send_stage(
            ws,
            "extraction",
            "completed",
            {
                "extracted": len(
                    extracted_articles
                )
            }
        )

        # ====================================================
        # 5. EMBEDDING
        # ====================================================

        await send_stage(
            ws,
            "embedding",
            "processing"
        )

        vectors = []

        for article in extracted_articles:

            vector = article.get(
                "embedding"
            )

            if vector is not None:

                try:

                    vector = np.asarray(
                        vector,
                        dtype=float
                    )

                    # Only accept non-empty vectors
                    if vector.size > 0:
                        vectors.append(
                            vector
                        )

                except Exception:
                    pass

        # ----------------------------------------------------
        # Real embeddings available
        # ----------------------------------------------------

        if len(vectors) == len(
            extracted_articles
        ):

            try:

                vectors = np.asarray(
                    vectors,
                    dtype=float
                )

            except Exception:

                vectors = np.zeros(
                    (
                        len(extracted_articles),
                        2
                    ),
                    dtype=float
                )

        # ----------------------------------------------------
        # Embeddings unavailable
        #
        # This is ONLY a visualization fallback.
        # It must not be treated as real embeddings.
        # ----------------------------------------------------

        else:

            vectors = np.zeros(
                (
                    len(extracted_articles),
                    2
                ),
                dtype=float
            )

        # ----------------------------------------------------
        # Make sure vector matrix is valid
        # ----------------------------------------------------

        if vectors.ndim == 1:

            vectors = vectors.reshape(
                len(extracted_articles),
                -1
            )

        if not np.isfinite(
            vectors
        ).all():

            vectors = np.nan_to_num(
                vectors,
                nan=0.0,
                posinf=0.0,
                neginf=0.0
            )

        # ----------------------------------------------------
        # PCA visualization
        # ----------------------------------------------------

        points = project_2d(
            vectors
        )

        embedding_points = []

        for article, point in zip(
            extracted_articles,
            points
        ):

            embedding_points.append({
                "id": article.get(
                    "id"
                ),
                "title": (
                    article.get(
                        "title",
                        ""
                    )[:60]
                ),
                "x": point["x"],
                "y": point["y"]
            })

        await send_stage(
            ws,
            "embedding",
            "completed",
            {
                "embeddings": len(
                    extracted_articles
                ),
                "points": embedding_points
            }
        )

        # ====================================================
        # 6. CLUSTERING
        # ====================================================

        await send_stage(
            ws,
            "clustering",
            "processing"
        )

        # ----------------------------------------------------
        # IMPORTANT FIX
        #
        # Your existing run_clustering() function accepts
        # ZERO positional arguments.
        #
        # Therefore it must be called like this:
        #
        #     run_clustering()
        #
        # Do not pass extracted_articles or vectors.
        # ----------------------------------------------------

        clusters = await asyncio.to_thread(
            run_clustering
        )

        if clusters is None:

            clusters = []

        # ----------------------------------------------------
        # Dendrogram for visualization
        # ----------------------------------------------------

        labels = [
            article.get(
                "title",
                ""
            )[:40]
            for article in extracted_articles
        ]

        dendrogram = build_dendrogram(
            vectors,
            labels
        )

        await send_stage(
            ws,
            "clustering",
            "completed",
            {
                "clusters": len(
                    clusters
                ),
                "cluster_details": clusters,
                "dendrogram": dendrogram
            }
        )

        # ====================================================
        # 7. PEGASUS / ARTICLE GENERATION
        # ====================================================

        await send_stage(
            ws,
            "pegasus",
            "processing"
        )

        generated = await asyncio.to_thread(
            process_clusters,
        )

        if generated is None:

            generated = []

        await send_stage(
            ws,
            "pegasus",
            "completed",
            {
                "generated": len(
                    generated
                ),
                "generated_articles": generated
            }
        )

        # ====================================================
        # 8. MONGODB
        # ====================================================

        await send_stage(
            ws,
            "mongodb",
            "processing"
        )

        await asyncio.sleep(0.2)

        # Do not invent MongoDB IDs.
        #
        # Existing MongoDB storage remains responsible
        # for persistent storage.

        saved_ids = []

        await send_stage(
            ws,
            "mongodb",
            "completed",
            {
                "saved_ids": saved_ids,
                "message": (
                    "Article generation completed. "
                    "Use the existing MongoDB storage "
                    "layer for persistent storage."
                )
            }
        )

    # ========================================================
    # CLIENT DISCONNECTED
    # ========================================================

    except WebSocketDisconnect:

        logger.info("[PIPELINE] Showcase client disconnected")

        return

    # ========================================================
    # GENERAL ERROR
    # ========================================================

    except Exception as exc:

        traceback.print_exc()
        logger.exception("[PIPELINE] Showcase failed: %s", exc)

        try:

            await send_stage(
                ws,
                "error",
                "error",
                {
                    "message": str(exc)
                }
            )

        except Exception:

            pass

    # ========================================================
    # CLOSE WEBSOCKET
    # ========================================================

    finally:

        duration = (datetime.now(timezone.utc) - run_started).total_seconds()
        logger.info("[PIPELINE] Showcase session finished in %.2fs", duration)

        try:

            await ws.close()

        except Exception:

            pass