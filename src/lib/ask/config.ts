import "server-only";

/** True when the concierge has a model key. Without one the page explains it's coming. */
export const hasAsk = () => Boolean(process.env.ANTHROPIC_API_KEY);
