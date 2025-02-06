export type DidDocument = {
	'@context': string[];
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

export const fetchDidDocument = async (did: string) => {
  let res: Response;
  if (did.startsWith('did:plc:')) {
    res = await fetch(`https://plc.directory/${did}`);
  } else if (did.startsWith('did:web:')) {
    res = await fetch(`https://${did.slice('did:web:'.length)}/.well-known/did.json`);
  } else {
    return null;
  }

  return res.json() as Promise<DidDocument>;
};

export const getPdsUrl = (didDoc: DidDocument) => {
  const service = didDoc.service?.find((s) => s.type === 'AtprotoPersonalDataServer');
  if (!service) return null;
  return service.serviceEndpoint;
}
