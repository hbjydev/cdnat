import { getBlob } from "./blob";
import {
  cacheDidDoc,
  getCachedBlobVerification,
  getCachedDidDoc,
  setCachedBlobVerification,
} from "./kv";
import { CdnContext } from "./types";
import * as atcuteCid from "@atcute/cid";

export type DidDocument = {
  "@context": string[];
  id: string;
  alsoKnownAs?: string[];
  verificationMethod?: {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
  }[];
  service?: { id: string; type: string; serviceEndpoint: string }[];
};

export const fetchDidDocument = async (ctx: CdnContext, did: string) => {
  const cachedDidDoc = await getCachedDidDoc(ctx, did);
  if (cachedDidDoc) {
    return cachedDidDoc;
  }

  let res: Response;
  if (did.startsWith("did:plc:")) {
    res = await fetch(`https://plc.directory/${did}`);
  } else if (did.startsWith("did:web:")) {
    res = await fetch(
      `https://${did.slice("did:web:".length)}/.well-known/did.json`,
    );
  } else {
    return null;
  }

  const didDoc = (await res.json()) as DidDocument;

  await cacheDidDoc(ctx, did, didDoc);
  return didDoc;
};

export const getPdsUrl = (didDoc: DidDocument) => {
  const service = didDoc.service?.find(
    (s) => s.type === "AtprotoPersonalDataServer",
  );
  if (!service) return null;
  return service.serviceEndpoint;
};

export const verifyCid = async (cid: string, blob: Blob) => {
  const strCid = atcuteCid.fromString(cid);
  const blobCid = await atcuteCid.create(
    strCid.codec as 85 | 113,
    await blob.bytes(),
  );

  return JSON.stringify(strCid) === JSON.stringify(blobCid);
};

export const pullAndVerifyCid = async (
  ctx: CdnContext,
  pdsUrl: string,
  did: string,
  cid: string,
) => {
  const cachedVerify = await getCachedBlobVerification(ctx, pdsUrl, did, cid);
  if (cachedVerify) {
    return cachedVerify;
  }

  const blobRes = await getBlob(pdsUrl, did, cid, {});
  const blobData = await blobRes.blob();

  const verified = await verifyCid(cid, blobData);

  await setCachedBlobVerification(ctx, pdsUrl, did, cid, verified);

  return verified;
};
