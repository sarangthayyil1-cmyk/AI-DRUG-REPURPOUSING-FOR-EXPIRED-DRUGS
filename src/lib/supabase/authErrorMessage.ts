/**
 * Turn a Supabase auth error into a message fit for the login/signup forms.
 * Network failures surface as a bare "Failed to fetch", which reads like a
 * bug on the user's side — replace it with something actionable.
 */
export function authErrorMessage(error: { name?: string; message: string }): string {
  const isNetworkError =
    error.name === "AuthRetryableFetchError" ||
    /failed to fetch|network|load failed/i.test(error.message);

  return isNetworkError
    ? "Can't reach the sign-in service right now. Please try again in a few minutes."
    : error.message;
}
