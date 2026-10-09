import React from "react";

/** Token chips from the real tokenizer output (classify_articles meta). */
export function TokenChips({ tokens }) {
  if (!tokens || tokens.length === 0) return null;
  return (
    <div className="token-list">
      {tokens.map((t, i) => (
        <span key={i}>{t}</span>
      ))}
    </div>
  );
}

/**
 * Scatter plot of the real embedding vectors, PCA-reduced to 2D by the
 * backend. Colors are assigned once clusterMap (article id -> cluster
 * index) is available; before that every point renders in a neutral color.
 */
export function EmbeddingScatter({ points, clusterMap }) {
  if (!points || points.length === 0) return null;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const W = 460;
  const H = 280;
  const pad = 34;

  const scaleX = (x) => pad + ((x - minX) / rangeX) * (W - pad * 2);
  const scaleY = (y) => H - pad - ((y - minY) / rangeY) * (H - pad * 2);

  const palette = ["#39d0c2", "#f2b84b", "#e2668a", "#7aa6f0", "#a893e0", "#8bd17c"];
  const colorFor = (id) => {
    if (!clusterMap || !(id in clusterMap)) return "#7f92a8";
    return palette[clusterMap[id] % palette.length];
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="scatter-svg" role="img" aria-label="Embedding projection">
      <rect x="0" y="0" width={W} height={H} className="scatter-bg" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={scaleX(p.x)} cy={scaleY(p.y)} r={7} fill={colorFor(p.id)} stroke="#0b121c" strokeWidth="1.5" />
          <title>{p.title}</title>
        </g>
      ))}
    </svg>
  );
}

/**
 * Classic dendrogram layout algorithm (same approach scipy uses internally):
 * each leaf starts at x = its index, y = 0. Each merge places the new node
 * at the midpoint x of its two children, at y = the merge distance, then
 * draws the two vertical connectors and the horizontal bridge between them.
 */
export function Dendrogram({ dendrogram }) {
  if (!dendrogram || !dendrogram.merges || dendrogram.merges.length === 0) return null;

  const { merges, labels } = dendrogram;
  const n = labels.length;
  const W = 460;
  const H = 260;
  const padTop = 20;
  const padBottom = 64;
  const padSide = 24;

  const positions = {};
  labels.forEach((_, i) => {
    positions[i] = { x: i, y: 0 };
  });

  const maxDist = Math.max(...merges.map((m) => m.distance), 0.0001);

  const lines = [];
  merges.forEach((m, i) => {
    const pa = positions[m.a];
    const pb = positions[m.b];
    const newIndex = n + i;
    positions[newIndex] = { x: (pa.x + pb.x) / 2, y: m.distance };

    lines.push({ x1: pa.x, y1: pa.y, x2: pa.x, y2: m.distance });
    lines.push({ x1: pb.x, y1: pb.y, x2: pb.x, y2: m.distance });
    lines.push({ x1: pa.x, y1: m.distance, x2: pb.x, y2: m.distance });
  });

  const xScale = (x) => padSide + (x / Math.max(n - 1, 1)) * (W - padSide * 2);
  const yScale = (y) => H - padBottom - (y / maxDist) * (H - padTop - padBottom);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dendrogram-svg" role="img" aria-label="Cluster dendrogram">
      {lines.map((l, i) => (
        <line
          key={i}
          x1={xScale(l.x1)}
          y1={yScale(l.y1)}
          x2={xScale(l.x2)}
          y2={yScale(l.y2)}
          stroke="#39d0c2"
          strokeWidth="1.5"
        />
      ))}
      {labels.map((label, i) => (
        <text
          key={i}
          x={xScale(i)}
          y={H - padBottom + 16}
          fontSize="9"
          fill="#8e9bad"
          textAnchor="end"
          transform={`rotate(-40, ${xScale(i)}, ${H - padBottom + 16})`}
        >
          {label.length > 16 ? `${label.slice(0, 16)}…` : label}
        </text>
      ))}
    </svg>
  );
}
