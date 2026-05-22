interface Env {
  ADMIN_CODE: string;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
}

interface UpdateRequest {
  file: "data/schedule.json" | "data/standings.json";
  content: unknown;
  message: string;
}

const ALLOWED_FILES = new Set(["data/schedule.json", "data/standings.json"]);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const code = request.headers.get("X-Admin-Code");
  if (!code || code !== env.ADMIN_CODE) {
    return json({ error: "Wrong passcode" }, 401);
  }

  let body: UpdateRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!ALLOWED_FILES.has(body.file)) {
    return json({ error: `File not allowed: ${body.file}` }, 400);
  }
  if (!Array.isArray(body.content)) {
    return json({ error: "content must be an array" }, 400);
  }
  if (typeof body.message !== "string" || body.message.length === 0) {
    return json({ error: "message is required" }, 400);
  }
  if (body.message.length > 200) {
    return json({ error: "message too long" }, 400);
  }

  const repo = env.GITHUB_REPO;
  const ghBase = `https://api.github.com/repos/${repo}/contents/${body.file}`;
  const headers = {
    "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
    "Accept": "application/vnd.github+json",
    "User-Agent": "maida-esports-admin",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  const getRes = await fetch(ghBase, { headers });
  if (!getRes.ok) {
    return json({ error: `GitHub read failed (${getRes.status})` }, 502);
  }
  const fileMeta = await getRes.json() as { sha: string };

  const newContent = JSON.stringify(body.content, null, 2) + "\n";
  const encoded = base64(newContent);

  const putRes = await fetch(ghBase, {
    method: "PUT",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({
      message: body.message,
      content: encoded,
      sha: fileMeta.sha,
      branch: "main"
    })
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    return json({ error: `GitHub write failed (${putRes.status}): ${err.slice(0, 200)}` }, 502);
  }

  const result = await putRes.json() as { commit: { sha: string; html_url: string } };
  return json({ ok: true, commitSha: result.commit.sha, commitUrl: result.commit.html_url });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" }
  });
}

function base64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}
