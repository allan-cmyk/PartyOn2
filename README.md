# SEO snapshots — partyondelivery.com

This branch holds the weekly JSON output of the `seo-semrush-snapshot` Cowork skill.

- **Producer:** `Cowork-Workspace/projects/party-on-delivery/skills/seo-semrush-snapshot/`
  on Allan's Mac (later: the always-on Acer). Runs every Monday 15:00 UTC.
- **Consumer (planned):** Vercel cron in `allan-cmyk/PartyOn2` that loads
  `data/seo/semrush/<date>/*.json` into the `SeoSnapshot` Postgres table, which
  feeds the SEO Director agent's Monday briefing.

This is an **orphan** branch — no shared history with `main` or `dev`. Fresh
clones of `allan-cmyk/PartyOn2` won't pull this data unless someone explicitly
runs `git fetch origin seo-snapshots`.
