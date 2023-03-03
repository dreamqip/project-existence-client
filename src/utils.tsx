export function waitFor(conditionFunction: () => boolean) {
  const poll = (resolve: (value?: unknown) => void) => {
    if (conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 200);
  }
  return new Promise(poll);
}

export type Metadata = {
  name?: string;
  description?: string;
  contacts?: {
    link?: string;
    phone?: string;
    email?: string;
  };
  imageLink?: string;
}

export function parseMetadata(rawMetadata: string) {
  try {
    let metadata = JSON.parse(rawMetadata);
    if (typeof metadata.contacts == 'string') {
      try {
        metadata.contacts = JSON.parse(metadata.contacts);
      } catch {
        metadata.contacts = { email: metadata.contacts }
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