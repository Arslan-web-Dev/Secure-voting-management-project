export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong'
) => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error as { message?: unknown };
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
};
