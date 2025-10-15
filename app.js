const express = require('express')
const rTracer = require('cls-rtracer')
const logger = require('./utils/logger')
const config = require('./config/environment')

const app = express()

// Middleware
app.use(rTracer.expressMiddleware()) // Must be first for trace ID tracking
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - startTime
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    })
  })

  next()
})

// Test Routes
app.get('/', (req, res) => {
  logger.info('Root endpoint accessed')
  res.json({
    message: 'CloudWatch Logger Test Server',
    environment: config.NODE_ENV,
    cloudwatchEnabled: config.AWS.CLOUDWATCH_ENABLED,
    logGroup: config.AWS.CLOUDWATCH_LOG_GROUP,
    timestamp: new Date().toISOString(),
  })
})

app.get('/test/info', (req, res) => {
  logger.info('Info log test', {
    testId: 'info-001',
    message: 'This is a test INFO log',
  })
  res.json({ logged: 'info', message: 'Check CloudWatch for the log' })
})

app.get('/test/warn', (req, res) => {
  logger.warn('Warning log test', {
    testId: 'warn-001',
    message: 'This is a test WARNING log',
  })
  res.json({ logged: 'warn', message: 'Check CloudWatch for the log' })
})

app.get('/test/error', (req, res) => {
  logger.error('Error log test', {
    testId: 'error-001',
    message: 'This is a test ERROR log',
    error: 'Simulated error for testing',
  })
  res.json({ logged: 'error', message: 'Check CloudWatch for the log' })
})

app.get('/test/all', (req, res) => {
  logger.info('Testing all log levels')
  logger.debug('Debug level - detailed info', { detail: 'some data' })
  logger.info('Info level - important event', { userId: 'test-123' })
  logger.warn('Warn level - warning condition', { warning: 'potential issue' })
  logger.error('Error level - error occurred', { error: 'something failed' })

  res.json({
    message: 'All log levels tested',
    note: 'Check CloudWatch - debug may not appear in production mode',
  })
})

app.get('/test/metadata', (req, res) => {
  logger.info('Log with rich metadata', {
    userId: 'user-456',
    action: 'test-metadata',
    timestamp: new Date().toISOString(),
    nested: {
      data: 'nested object',
      array: [1, 2, 3],
    },
  })
  res.json({ logged: 'metadata', message: 'Check CloudWatch for structured data' })
})

// Simulate error
app.get('/test/throw-error', (req, res, next) => {
  const error = new Error('This is a test error')
  error.statusCode = 500
  next(error)
})

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
  })
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  })
})

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  res.status(err.statusCode || 500).json({
    error: config.NODE_ENV === 'development' ? err.message : 'An error occurred',
  })
})

// Start server
const PORT = config.PORT || 3000
app.listen(PORT, () => {
  logger.info(`Server started`, {
    port: PORT,
    environment: config.NODE_ENV,
    cloudwatch: config.AWS.CLOUDWATCH_ENABLED ? 'ENABLED' : 'DISABLED',
  })
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('Test endpoints:')
  console.log('  GET /')
  console.log('  GET /test/info')
  console.log('  GET /test/warn')
  console.log('  GET /test/error')
  console.log('  GET /test/all')
  console.log('  GET /test/metadata')
  console.log('  GET /test/throw-error')
})
