export function waitFor(conditionFunction: () => boolean) {
    const poll = (resolve: (value?: unknown) => void) => {
        if (conditionFunction()) resolve();
        else setTimeout(() => poll(resolve), 200);
    }
    return new Promise(poll);
}
