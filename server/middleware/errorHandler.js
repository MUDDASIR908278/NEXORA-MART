/**
 * 404 handler — runs when no route matched.
 */
export function notFound(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

/**
 * Central error handler. Any middleware/controller can call next(err)
 * (or throw inside an async wrapper) and this will format the response.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  // Log the full error server-side for debugging
  // eslint-disable-next-line no-console
  console.error('[API ERROR]', {
    message: err?.message,
    status: err?.status || err?.statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: err?.stack,
  })

  const status = Number(err?.status || err?.statusCode) || 500

  // Never leak internal messages on 5xx in production
  const isServerError = status >= 500
  const message =
    err?.publicMessage ||
    (isServerError && process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err?.message || 'Internal server error.')

  const body = { message }

  // Include field-level validation errors if provided
  if (err?.errors) body.errors = err.errors

  // Include stack only in development
  if (process.env.NODE_ENV !== 'production' && err?.stack) {
    body.stack = err.stack
  }

  res.status(status).json(body)
}

/**
 * Helper for throwing HTTP errors from controllers.
 *
 *   throw httpError(400, 'Invalid input.')
 */
export function httpError(status, message, extra = {}) {
  const err = new Error(message)
  err.status = status
  err.publicMessage = message
  Object.assign(err, extra)
  return err
}

/**
 * Wrap async route handlers so rejected promises reach errorHandler.
 * Usage: router.get('/', wrap(async (req, res) => { ... }))
 */
export function wrap(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default errorHandler