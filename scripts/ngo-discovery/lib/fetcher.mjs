export const USER_AGENT = "CorpoGN-NGO-Discovery/1.0 (+https://corpogn.com/about)";

const RATE_LIMIT_MS = 1500;
const MAX_FETCHES = parseInt(process.env.MAX_FETCHES ?? "1500", 10);
const lastFetchTime = new Map();
const robotsCache = new Map();
let fetchCount = 0;

export async function assertRobotsAllowed(url) {
  const parsed = new URL(url);
  const domain = parsed.hostname;

  if (!robotsCache.has(domain)) {
    const robotsUrl = `${parsed.protocol}//${domain}/robots.txt`;
    let robots = { allowed: [], disallowed: [] };

    try {
      const res = await rawFetch(robotsUrl, { timeout: 8000 });
      if (res.ok) robots = parseRobotsTxt(await res.text());
    } catch {
      console.warn(`Could not fetch robots.txt for ${domain}; assuming allowed`);
    }

    robotsCache.set(domain, robots);
  }

  const robots = robotsCache.get(domain);
  const path = parsed.pathname || "/";
  const disallowed = matchesPrefix(path, robots.disallowed);
  const allowed = matchesPrefix(path, robots.allowed);

  if (disallowed && !allowed) {
    throw new Error(`robots.txt on ${domain} disallows "${path}"`);
  }
}

export async function rateLimitedFetch(url, opts = {}) {
  fetchCount++;
  if (fetchCount > MAX_FETCHES) {
    throw new Error(`MAX_FETCHES ceiling of ${MAX_FETCHES} reached`);
  }

  const domain = new URL(url).hostname;
  const last = lastFetchTime.get(domain) ?? 0;
  const elapsed = Date.now() - last;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
  }
  lastFetchTime.set(domain, Date.now());

  return rawFetch(url, opts);
}

async function rawFetch(url, opts = {}) {
  const { timeout = 15000, ...rest } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,*/*",
        "Accept-Language": "en-IN,en;q=0.9",
        ...(rest.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function parseRobotsTxt(body) {
  const allowed = [];
  const disallowed = [];
  let applies = false;

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const lower = line.toLowerCase();

    if (lower.startsWith("user-agent:")) {
      applies = line.slice("user-agent:".length).trim() === "*";
      continue;
    }

    if (!applies) continue;
    if (lower.startsWith("allow:")) {
      const value = line.slice("allow:".length).trim();
      if (value) allowed.push(value);
    } else if (lower.startsWith("disallow:")) {
      const value = line.slice("disallow:".length).trim();
      if (value) disallowed.push(value);
    }
  }

  return { allowed, disallowed };
}

function matchesPrefix(path, prefixes) {
  return prefixes.some((prefix) => path.startsWith(prefix));
}
