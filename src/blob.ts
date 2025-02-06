export const getBlob = (
  pdsUrl: string,
  did: string,
  cid: string,
  options: RequestInit,
) => {
  const url = new URL('/xrpc/com.atproto.sync.getBlob', pdsUrl);
  url.searchParams.set('did', did);
  url.searchParams.set('cid', cid);

  const request = new Request(url);
  return fetch(request, options);
};
