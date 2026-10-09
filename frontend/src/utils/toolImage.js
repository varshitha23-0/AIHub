function getDomain(url = "") {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Build ordered image candidates for a tool (logo → favicons). */
export function getToolImageCandidates(tool = {}) {
  const candidates = [];
  const logo = String(tool.logo || "").trim();
  if (logo) candidates.push(logo);

  const domain = getDomain(tool.website);
  if (domain) {
    candidates.push(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
    );
    candidates.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }

  return [...new Set(candidates)];
}
