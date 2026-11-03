export function getErrorMessage(error) {
  if (error && error.response && error.response.data) {
    const data = error.response.data;
    if (data.message) {
      const details =
        Array.isArray(data.details) && data.details.length > 0
          ? ' (' + data.details.join('; ') + ')'
          : '';
      return data.message + details;
    }
  }
  if (error && error.code === 'ECONNABORTED') {
    return 'The server took too long to respond. Please try again.';
  }
  if (error && error.request) {
    return 'Cannot reach the server. Check that the backend is running.';
  }
  return 'Something went wrong. Please try again.';
}