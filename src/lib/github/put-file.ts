/**
 * Shared GitHub "create or update file" helper. Used by the marketing briefing
 * delivery and the recommendation mirror. Server-side only — relies on the
 * GITHUB_REPO_TOKEN env var.
 *
 * If GITHUB_REPO_TOKEN is unset, the put returns { committed: false, error } and
 * callers fail-soft so cron / API responses stay green.
 */

const REPO_OWNER = process.env.GITHUB_REPO_OWNER ?? 'allan-cmyk';
const REPO_NAME = process.env.GITHUB_REPO_NAME ?? 'PartyOn2';
const REPO_BRANCH = process.env.GITHUB_REPO_BRANCH ?? 'main';

export interface PutFileResult {
  committed: boolean;
  sha?: string;
  htmlUrl?: string;
  error?: string;
}

export async function putFileToRepo(params: {
  path: string;
  content: string;
  message: string;
}): Promise<PutFileResult> {
  const token = process.env.GITHUB_REPO_TOKEN;
  if (!token) {
    return { committed: false, error: 'GITHUB_REPO_TOKEN not configured' };
  }

  const { path, content, message } = params;
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // GET to learn the existing SHA (so the PUT updates instead of erroring on duplicate path).
  let existingSha: string | undefined;
  const getRes = await fetch(`${url}?ref=${REPO_BRANCH}`, { headers });
  if (getRes.ok) {
    const body = (await getRes.json()) as { sha?: string };
    existingSha = body.sha;
  }
  // 404 here is fine — file doesn't exist yet, we'll create.

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      branch: REPO_BRANCH,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  });

  if (!putRes.ok) {
    const body = await putRes.text();
    return { committed: false, error: `GitHub PUT ${putRes.status}: ${body.slice(0, 300)}` };
  }

  const body = (await putRes.json()) as { content?: { sha?: string; html_url?: string } };
  return { committed: true, sha: body.content?.sha, htmlUrl: body.content?.html_url };
}
