import { ethers } from "ethers";

export function waitFor(conditionFunction: () => boolean) {
  const poll = (resolve: (value?: unknown) => void) => {
    if (conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 200);
  };
  return new Promise(poll);
}

export function timestampToDate(milliseconds: string | number, extended = false) {
  const numbers = typeof milliseconds == "number" ? milliseconds : parseInt(milliseconds) * 1000;
  const dateObj = new Date(numbers);

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  let hour = dateObj.getHours().toString();
  if(hour.length != 2) hour = "0"+hour;
  let minute = dateObj.getMinutes().toString();
  if(minute.length != 2) minute = "0"+minute;

  return `${day}-${month}-${year}`+(extended ? ` ${hour}:${minute}` : '');
}

export type Metadata = {
  name?: string;
  description?: string;
  banner?: string;
  contacts?: {
    link?: string;
    phone?: string;
    email?: string;
  };
  imageLink?: string;
};

export function parseMetadata(rawMetadata: string) {
  try {
    let metadata = JSON.parse(rawMetadata);
    if (typeof metadata.contacts == 'string') {
      try {
        metadata.contacts = JSON.parse(metadata.contacts);
      } catch {
        metadata.contacts = { email: metadata.contacts };
      }
    }
    return metadata as Metadata;
  } catch {
    return { description: rawMetadata } as Metadata;
  }
}

export function serializeMetadata(metadata: Metadata) {
  return JSON.stringify(metadata);
}

export function toFunctionSelector(minifiedFunction: string) {
  return ethers
    .keccak256(ethers.toUtf8Bytes(minifiedFunction))
    .slice(2, 10);
}
