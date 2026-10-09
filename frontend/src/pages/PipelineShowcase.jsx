import React, { useCallback, useRef, useState } from "react";
import "./PipelineShowcase.css";
import { Dendrogram, EmbeddingScatter, TokenChips } from "../components/PipelineVisuals";

// Adjust to wherever your FastAPI app is actually mounted.
const WS_URL = "ws://127.0.0.1:8000/pipeline/showcase/ws";

const STAGES = [
  { id: "collection", number: 1, title: "News Collection", subtitle: "Collect articles from multiple sources" },
  { id: "normalization", number: 2, title: "Normalization", subtitle: "Convert different source formats into one structure" },
  { id: "bert", number: 3, title: "BERT Classification", subtitle: "Check whether the article is AI-relevant" },
  { id: "extraction", number: 4, title: "Article Extraction", subtitle: "Extract full article content where available" },
  { id: "embedding", number: 5, title: "Semantic Embedding", subtitle: "Convert article text into semantic vectors" },
  { id: "clustering", number: 6, title: "Agglomerative Clustering", subtitle: "Group semantically related articles" },
  { id: "pegasus", number: 7, title: "PEGASUS", subtitle: "Generate a concise abstractive article" },
  { id: "mongodb", number: 8, title: "MongoDB", subtitle: "Store the generated article" },
];

const demoArticles = [
  { id: 1, source: "NewsAPI", title: "OpenAI introduces a new AI model for developers", description: "The new model improves reasoning and developer applications.", url: "https://example.com/openai-model" },
  { id: 2, source: "GNews", title: "New OpenAI model improves AI reasoning capabilities", description: "The latest model focuses on stronger reasoning and developer workloads.", url: "https://example.com/openai-reasoning" },
  { id: 3, source: "Currents", title: "Developers get access to OpenAI's latest AI model", description: "The company has announced a new model aimed at developers.", url: "https://example.com/developers-ai" },
  { id: 4, source: "NewsAPI", title: "Samsung announces its latest smartphone", description: "The company revealed a new smartphone with upgraded hardware.", url: "https://example.com/samsung-phone" },
  { id: 5, source: "GNews", title: "New machine learning tools released for developers", description: "Developers can now use several new machine learning capabilities.", url: "https://example.com/ml-tools" },
];

export default function PipelineShowcase() {
  const [selectedArticles, setSelectedArticles] = useState([0, 1, 2, 4]);
  const [stageStatus, setStageStatus] = useState({});
  const [stageData, setStageData] = useState({});
  const [connection, setConnection] = useState("idle"); // idle | connecting | streaming | done | error
  const [errorMessage, setErrorMessage] = useState("");
  const wsRef = useRef(null);

  const toggleArticle = (index) => {
    setSelectedArticles((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const startPipeline = useCallback(() => {
    if (selectedArticles.length < 3) {
      alert("Select at least 3 articles.");
      return;
    }

    setStageStatus({});
    setStageData({});
    setErrorMessage("");
    setConnection("connecting");

    const articles = selectedArticles.map((i) => demoArticles[i]);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnection("streaming");
      ws.send(JSON.stringify({ articles }));
    };

    ws.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      const { stage, status, data } = msg;

      if (stage === "error") {
        setConnection("error");
        setErrorMessage(data?.message || "Pipeline failed.");
        return;
      }

      setStageStatus((prev) => ({ ...prev, [stage]: status }));
      if (data) {
        setStageData((prev) => ({ ...prev, [stage]: { ...(prev[stage] || {}), ...data } }));
      }
      if (stage === "mongodb" && status === "completed") {
        setConnection("done");
      }
    };

    ws.onerror = () => {
      setConnection("error");
      setErrorMessage("Could not reach the pipeline WebSocket. Confirm FastAPI is running and the route is mounted.");
    };

    ws.onclose = () => {
      setConnection((prev) => (prev === "streaming" ? "error" : prev));
    };
  }, [selectedArticles]);

  const getStatusIcon = (stageId) => {
    const status = stageStatus[stageId];
    if (status === "completed") return "✓";
    if (status === "processing") return "⟳";
    if (status === "error") return "✕";
    return "○";
  };

  const bertData = stageData.bert || {};
  const embeddingData = stageData.embedding || {};
  const clusteringData = stageData.clustering || {};
  const pegasusData = stageData.pegasus || {};
  const mongoData = stageData.mongodb || {};
  const clusterDetails = clusteringData.cluster_details || [];

  // article id -> cluster index, used to color the embedding scatter plot
  const clusterMap = {};
  clusterDetails.forEach((cluster, idx) => {
    (cluster.articles || []).forEach((a) => {
      clusterMap[a.id] = idx;
    });
  });

  const isRunning = connection === "connecting" || connection === "streaming";

  return (
    <div className="pipeline-page">
      <div className="pipeline-header">
        <div>
          <p className="eyebrow">ML / NLP DEMONSTRATION</p>
          <h1>News Processing Pipeline</h1>
          <p>Select articles and watch them move through the live pipeline, streamed in real time from the backend.</p>
        </div>

        <div className={`connection-badge ${connection}`}>
          {connection === "idle" && "Idle"}
          {connection === "connecting" && "Connecting…"}
          {connection === "streaming" && "● Live"}
          {connection === "done" && "✓ Complete"}
          {connection === "error" && "⚠ Connection issue"}
        </div>
      </div>

      {connection === "error" && <div className="error-banner">{errorMessage}</div>}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>1. Select News Articles</h2>
            <p>Select 3–5 articles for the pipeline demonstration.</p>
          </div>
          <span className="count-badge">{selectedArticles.length} selected</span>
        </div>

        <div className="article-selection">
          {demoArticles.map((article, index) => {
            const selected = selectedArticles.includes(index);
            return (
              <button
                key={article.id}
                className={selected ? "article-select-card selected" : "article-select-card"}
                onClick={() => toggleArticle(index)}
              >
                <div className="article-check">{selected ? "✓" : ""}</div>
                <div className="article-source">{article.source}</div>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
              </button>
            );
          })}
        </div>

        <button className="run-button" onClick={startPipeline} disabled={isRunning}>
          {isRunning ? "Streaming…" : "▶ Start Pipeline"}
        </button>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>2. Processing Pipeline</h2>
            <p>Live status streamed from the FastAPI pipeline over WebSocket.</p>
          </div>
        </div>

        <div className="pipeline">
          {STAGES.map((stage, index) => {
            const status = stageStatus[stage.id];
            return (
              <React.Fragment key={stage.id}>
                <div
                  className={`pipeline-stage ${status === "completed" ? "completed" : ""} ${
                    status === "processing" ? "processing" : ""
                  } ${status === "error" ? "stage-error" : ""}`}
                >
                  <div className="stage-number">{getStatusIcon(stage.id)}</div>
                  <div className="stage-content">
                    <span>STEP {stage.number}</span>
                    <h3>{stage.title}</h3>
                    <p>{stage.subtitle}</p>

                    {stage.id === "collection" && stageData.collection?.collected > 0 && (
                      <strong>{stageData.collection.collected} articles</strong>
                    )}
                    {stage.id === "normalization" && stageData.normalization?.normalized > 0 && (
                      <strong>{stageData.normalization.normalized} normalized</strong>
                    )}
                    {stage.id === "bert" && bertData.ai_relevant !== undefined && (
                      <strong>
                        AI-relevant: {bertData.ai_relevant} · Rejected: {bertData.rejected}
                      </strong>
                    )}
                    {stage.id === "extraction" && stageData.extraction?.extracted > 0 && (
                      <strong>Extracted: {stageData.extraction.extracted}</strong>
                    )}
                    {stage.id === "embedding" && embeddingData.embeddings > 0 && (
                      <strong>Embeddings: {embeddingData.embeddings}</strong>
                    )}
                    {stage.id === "clustering" && clusteringData.clusters > 0 && (
                      <strong>Clusters formed: {clusteringData.clusters}</strong>
                    )}
                    {stage.id === "pegasus" && pegasusData.generated > 0 && (
                      <strong>Generated: {pegasusData.generated}</strong>
                    )}
                    {stage.id === "mongodb" && mongoData.saved_ids?.length > 0 && (
                      <strong>Saved {mongoData.saved_ids.length} document(s)</strong>
                    )}
                  </div>
                </div>
                {index < STAGES.length - 1 && <div className="pipeline-arrow">↓</div>}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {bertData.tokens_sample && (
        <section className="panel detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">MODEL DETAIL</p>
              <h2>How BERT reads the article</h2>
              <p>Actual tokenizer output from the classification stage.</p>
            </div>
          </div>
          <TokenChips tokens={bertData.tokens_sample} />
        </section>
      )}

      {embeddingData.points?.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">VECTOR SPACE</p>
              <h2>Embedding Projection</h2>
              <p>Real sentence-transformer vectors, reduced to 2D with PCA. Colors update once clustering completes.</p>
            </div>
          </div>
          <EmbeddingScatter points={embeddingData.points} clusterMap={clusterMap} />
        </section>
      )}

      {clusteringData.dendrogram?.merges?.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">HIERARCHICAL MERGE</p>
              <h2>Dendrogram</h2>
              <p>Merge order and distance from agglomerative clustering.</p>
            </div>
          </div>
          <Dendrogram dendrogram={clusteringData.dendrogram} />
        </section>
      )}

      {clusterDetails.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">SEMANTIC GROUPING</p>
              <h2>Cluster Formation</h2>
            </div>
          </div>
          <div className="clusters-grid">
            {clusterDetails.map((cluster, i) => (
              <div className="cluster-card" key={cluster.name || i}>
                <div className="cluster-number">{cluster.name || `Cluster ${i + 1}`}</div>
                <h3>{cluster.topic || "Related coverage"}</h3>
                <p>{(cluster.articles || []).length} related article(s)</p>
                <div className="cluster-articles">
                  {(cluster.articles || []).map((a) => (
                    <div className="cluster-article" key={a.id}>
                      {a.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pegasusData.generated_articles?.length > 0 && (
        <section className="panel generated-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">FINAL OUTPUT</p>
              <h2>PEGASUS Generated Articles</h2>
            </div>
            <span className="success-badge">✓ Generated</span>
          </div>

          {pegasusData.generated_articles.map((g, i) => (
            <div className="generated-article" key={i}>
              <h3>{g.topic || g.title || `Article ${i + 1}`}</h3>
              <p>{g.article || g.text || g.summary || JSON.stringify(g)}</p>
              {g.source_articles?.length > 0 && (
                <div className="generated-sources">
                  <strong>Source articles</strong>
                  {g.source_articles.map((sourceArticle, sourceIndex) => (
                    <a
                      key={`${sourceArticle.url || sourceArticle.title}-${sourceIndex}`}
                      href={sourceArticle.url || undefined}
                      target={sourceArticle.url ? "_blank" : undefined}
                      rel={sourceArticle.url ? "noopener noreferrer" : undefined}
                    >
                      {sourceArticle.title || "Untitled source article"}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
