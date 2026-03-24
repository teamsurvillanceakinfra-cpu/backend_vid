export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    // Provide stack trace exclusively in non-production environments to avoid exposing system internals
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
