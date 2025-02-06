import { DidDocument } from "./atproto";
import { CdnContext } from "./types";

export const getCachedDidDoc = async (ctx: CdnContext, did: string) => {
  const res = await ctx.env.didCache.get(did, 'json');
  if (!res) return null;
  return res as DidDocument;
}

export const cacheDidDoc = async (ctx: CdnContext, did: string, didDoc: DidDocument) => {
  await ctx.env.didCache.put(
    did,
    JSON.stringify(didDoc),
    { expirationTtl: 3600 },
  );
}

const blobVerificationKey = (pdsUrl: string, did: string, cid: string) => `${pdsUrl}:${did}:${cid}`;
export const getCachedBlobVerification = async (ctx: CdnContext, pdsUrl: string, did: string, cid: string) => {
  const verified = await ctx.env.cidCache.get(blobVerificationKey(pdsUrl, did, cid), 'text');
  if (!verified) return null;
  return verified == "1";
};

export const setCachedBlobVerification = async (ctx: CdnContext, pdsUrl: string, did: string, cid: string, verified: boolean) => {
  await ctx.env.cidCache.put(
    blobVerificationKey(pdsUrl, did, cid),
    verified ? '1' : '0',
    { expirationTtl: 604800 }, // Cache for 7 days
  );
};
