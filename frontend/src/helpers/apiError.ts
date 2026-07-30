/** The message the API put in a failed response, if there is one (COS-297).
 *
 * The backend answers `{ error: "…" }` since `errorHandlerMiddleware` was finally mounted; the
 * validation middleware answers `{ msg, details }`, and the auth middlewares `{ error }`. This
 * reads whichever is there and returns `undefined` rather than a guess when the failure has no
 * message worth showing — a network drop, an HTML error page, a timeout. The caller supplies its
 * own fallback, because only the caller knows what the user was trying to do. */
const readApiError = (error: unknown): string | undefined => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;

  if (typeof data === "string" && data.length > 0 && !data.startsWith("<")) {
    return data;
  }

  if (data && typeof data === "object") {
    const { error: message, msg } = data as { error?: unknown; msg?: unknown };
    if (typeof message === "string" && message.length > 0) return message;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }

  return undefined;
};

export { readApiError };
