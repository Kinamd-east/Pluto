export const cleanIpfs = (uri: string) => uri.replace(/^ipfs:\/\//i, "");

export const toIpfsUri = (cleaned: string) =>
  cleaned.startsWith("ipfs://") ? cleaned : `ipfs://${cleaned}`;

export const ipfsToHttp = (uri: string, gateway = "https://ipfs.io/ipfs/") =>
  gateway + cleanIpfs(uri);
