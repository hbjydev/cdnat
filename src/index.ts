import { Hono } from "hono";
import { fetchDidDocument, getPdsUrl, pullAndVerifyCid } from "./atproto";
import { getBlob } from "./blob";
import { Bindings } from "./types";

const app = new Hono<Bindings>();

app.get(`/:typeName/:did/:cid`, async (c) => {
  const { typeName, did, cid } = c.req.param();
  if (typeName !== 'img') return c.notFound();

  let options = {
    cf: {
      image: {
        quality: 50,
        format: 'webp',
        fit: 'scale-down',
      },
      cacheKey: `${did}:${cid}/${typeName}`,
    } as RequestInitCfProperties,
  };

  if (c.req.query('fit')) options.cf.image!.fit = c.req.query('fit') as RequestInitCfPropertiesImage['fit'];
  if (c.req.query('width')) options.cf.image!.width = parseInt(c.req.query('width')!);
  if (c.req.query('height')) options.cf.image!.height = parseInt(c.req.query('height')!);

  const didDoc = await fetchDidDocument(c, did);
  if (!didDoc) return c.notFound();

  const pdsUrl = getPdsUrl(didDoc);
  if (!pdsUrl) return c.json({ message: 'Could not resolve PDS URL' }, 400);

  const verified = await pullAndVerifyCid(c, pdsUrl, did, cid);
  if (!verified) {
    return c.json({
      message: 'PDS blob CID did not match the requested blob CID.',
    }, 400);
  }

  return getBlob(pdsUrl, did, cid, options);
});

export default app;
