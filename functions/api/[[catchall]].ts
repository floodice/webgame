/**
 * Cloudflare Pages Function — proxy /api/* to the Worker backend.
 */
const WORKER_ORIGIN = 'https://webgame-api.tjnhfht.workers.dev';

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const target = new URL(url.pathname + url.search, WORKER_ORIGIN);

  const init: RequestInit = {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.method !== 'GET' && context.request.method !== 'HEAD'
      ? context.request.body
      : undefined,
  };

  return fetch(target.toString(), init);
};
