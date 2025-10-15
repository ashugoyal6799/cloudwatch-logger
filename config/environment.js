require("dotenv").config();

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  LOG_LEVEL:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),

  AWS: {
    REGION: process.env.AWS_REGION,
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    CLOUDWATCH_ENABLED: process.env.AWS_CLOUDWATCH_ENABLED === "true",
    CLOUDWATCH_LOG_GROUP: process.env.AWS_CLOUDWATCH_LOG_GROUP,
    CLOUDWATCH_LOG_STREAM: process.env.AWS_CLOUDWATCH_LOG_STREAM || "app",
    CLOUDWATCH_RETENTION_DAYS: parseInt(
      process.env.AWS_CLOUDWATCH_RETENTION_DAYS || "30",
      10
    ),
  },
};

module.exports = config;
