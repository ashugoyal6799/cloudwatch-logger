const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, errors, json } = format;
const rTracer = require("cls-rtracer");
const config = require("../config/environment");

const isDevelopment = config.NODE_ENV === "development";
const isProduction = config.NODE_ENV === "production";

// Development format - human readable
const devFormat = printf(
  ({ level, message, timestamp, stack, ...metadata }) => {
    const traceId = rTracer.id();
    const traceInfo = traceId ? `[TraceId: ${traceId}]` : "";
    const metaStr = Object.keys(metadata).length
      ? ` ${JSON.stringify(metadata)}`
      : "";
    return `${timestamp} [${level.toUpperCase()}] ${traceInfo} : ${
      stack || message
    }${metaStr}`;
  }
);

// Production format - JSON with trace ID
const prodFormat = combine(
  errors({ stack: true }),
  timestamp(),
  format((info) => {
    const traceId = rTracer.id();
    if (traceId) info.traceId = traceId;
    info.service = config.AWS.CLOUDWATCH_LOG_GROUP || "my-backend-service";
    return info;
  })(),
  json()
);

// Configure transports
const logTransports = [
  new transports.Console({
    format: isDevelopment
      ? combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), devFormat)
      : prodFormat,
  }),
];

// Add CloudWatch in production
if (isProduction && config.AWS.CLOUDWATCH_ENABLED) {
  const WinstonCloudWatch = require("winston-cloudwatch");

  const cloudwatchConfig = {
    logGroupName: config.AWS.CLOUDWATCH_LOG_GROUP,
    logStreamName: () => {
      const date = new Date().toISOString().split("T")[0];
      return `${config.AWS.CLOUDWATCH_LOG_STREAM || "app"}-${date}`;
    },
    awsRegion: config.AWS.REGION,
    jsonMessage: true,
    retentionInDays: config.AWS.CLOUDWATCH_RETENTION_DAYS || 30,
  };

  // Use IAM role if available, otherwise use access keys
  if (config.AWS.ACCESS_KEY_ID && config.AWS.SECRET_ACCESS_KEY) {
    cloudwatchConfig.awsAccessKeyId = config.AWS.ACCESS_KEY_ID;
    cloudwatchConfig.awsSecretKey = config.AWS.SECRET_ACCESS_KEY;
  }

  logTransports.push(new WinstonCloudWatch(cloudwatchConfig));
}

// Create logger
const logger = createLogger({
  level: config.LOG_LEVEL || (isProduction ? "info" : "debug"),
  format: prodFormat,
  transports: logTransports,
  exitOnError: false,
});

module.exports = logger;
