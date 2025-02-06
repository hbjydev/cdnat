import { Hono } from "hono";
import { DidDocument, fetchDidDocument, getPdsUrl } from "./atproto";

const app = new Hono<{ Bindings: Env }>();

app.get(`/:typeName/:did/:cid`, async (c) => {
  const { typeName, did, cid } = c.req.param();
  if (typeName !== 'img') return c.notFound();

  let options = {
    cf: {
      image: {
        quality: 50,
        format: 'webp',
        fit: 'scale-down',
      } as RequestInitCfPropertiesImage,
      cacheKey: `${did}:${cid}/${typeName}`,
    } as RequestInitCfProperties,
  };

  if (c.req.query('fit')) options.cf.image!.fit = c.req.query('fit') as RequestInitCfPropertiesImage['fit'];
  if (c.req.query('width')) options.cf.image!.width = parseInt(c.req.query('width')!);
  if (c.req.query('height')) options.cf.image!.height = parseInt(c.req.query('height')!);

  let didDoc: DidDocument;
  const cachedDid = await c.env.didCache.get(did, 'json');
  if (!cachedDid) {
    let doc = await fetchDidDocument(did);
    if (!doc) return c.notFound();
    await c.env.didCache.put(did, JSON.stringify(doc), {
      expirationTtl: 3600, // cache DID documents for an hour
    });
    didDoc = doc;
  }
  else didDoc = cachedDid as DidDocument;

  const pdsUrl = getPdsUrl(didDoc);
  if (!pdsUrl) return c.json({ message: 'Could not resolve PDS URL' }, 400);

  const imageUrl = new URL('/xrpc/com.atproto.sync.getBlob', pdsUrl);
  imageUrl.searchParams.set('did', did);
  imageUrl.searchParams.set('cid', cid);

  const imageRequest = new Request(imageUrl, {
    headers: c.req.header(),
  });

  const blobRes = await fetch(imageRequest, options);

  // TODO: Revisit this
  //const blobResClone = blobRes.clone();
  //const blob = await blobRes.blob();
  //const blobBytes = await blob.bytes();
  //const urlCid = atcuteCid.fromString(cid);
  //const blobCid = await atcuteCid.create(85, blobBytes);
  //const sameCid = JSON.stringify(urlCid.bytes) == JSON.stringify(blobCid.bytes)
  //if (!sameCid) return c.notFound();
  
  return blobRes;
});

export default app;
