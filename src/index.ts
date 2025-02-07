import { Hono } from "hono";
import { fetchDidDocument, getPdsUrl, pullAndVerifyCid } from "./atproto";
import { getBlob } from "./blob";
import { Bindings } from "./types";
import { Preset, presets } from "./presets";

const app = new Hono<Bindings>();

app.get(`/:typeName/:did/:cid`, async (c) => {
  const { typeName, did, cid } = c.req.param();

  if (!Object.keys(presets).includes(typeName)) return c.notFound();

  let options = {
    cf: {
      image: presets[typeName as Preset],
      cacheKey: `${did}:${cid}/${typeName}`,
    } as RequestInitCfProperties,
  };

  const didDoc = await fetchDidDocument(c, did);
  if (!didDoc) return c.notFound();

  const pdsUrl = getPdsUrl(didDoc);
  if (!pdsUrl) return c.json({ message: "Could not resolve PDS URL" }, 400);

  const verified = await pullAndVerifyCid(c, pdsUrl, did, cid);
  if (!verified) {
    return c.json(
      {
        message: "PDS blob CID did not match the requested blob CID.",
      },
      400,
    );
  }

  return getBlob(pdsUrl, did, cid, options);
});

export default app;
