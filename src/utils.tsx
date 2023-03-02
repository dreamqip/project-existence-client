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
    contacts?: string;
    imageLink?: string;
}

export function parseMetadata(rawMetadata: string) {
    try {
        return JSON.parse(rawMetadata) as Metadata;
    } catch {
        return {description: rawMetadata} as Metadata;
    }
}

export function serializeMetadata(metadata: Metadata) {
    return JSON.stringify(metadata);
}