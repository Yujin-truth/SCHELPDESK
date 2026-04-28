// Frontend API error handler
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.statusText) {
    return error.response.statusText;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const isAuthError = (error) => {
  return error.response?.status === 401;
};

export const isForbiddenError = (error) => {
  return error.response?.status === 403;
};

export const isValidationError = (error) => {
  return error.response?.status === 400;
};

export const isConflictError = (error) => {
  return error.response?.status === 409;
};
