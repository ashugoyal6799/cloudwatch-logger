const Sentry = require("@sentry/node");
const config = require("../config/environment");

Sentry.init({
  dsn: config.SENTRY.DSN,
  sendDefaultPii: true,
});
