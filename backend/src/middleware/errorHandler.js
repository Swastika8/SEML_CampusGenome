export const notFoundHandler = (req, res) =>
  res.status(404).json({ success: false, message: 'API endpoint not found.', requestId: req.id });
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.code === '23505' ? 409 : err.code === '23503' ? 404 : err.status || 500;
  if (status >= 500) console.error('Request', req.id, err.message);
  const message =
    status === 409
      ? 'This entry already exists.'
      : status === 404
        ? 'Resource not found.'
        : status >= 500
          ? 'Something went wrong. Please try again.'
          : err.type === 'entity.too.large'
            ? 'Request is too large.'
            : err.message;
  res.status(status).json({ success: false, message, requestId: req.id });
};
