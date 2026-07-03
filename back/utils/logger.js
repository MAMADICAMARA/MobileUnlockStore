// back/utils/logger.js
// console.log is silenced in production to avoid exposing sensitive data
// (emails, balances, internal paths) in server logs.
// console.error and console.warn are always active — they indicate real issues.
const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  log:   (...args) => { if (isDev) console.log(...args); },
  warn:  (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

module.exports = logger;
