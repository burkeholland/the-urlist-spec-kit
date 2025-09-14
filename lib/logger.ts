// Minimal structured logger. Expand later with levels & sinks.
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogFields { [k: string]: unknown }

function log(level: LogLevel, msg: string, fields?: LogFields) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}

export const logger = {
  debug: (msg: string, fields?: LogFields) => log('debug', msg, fields),
  info: (msg: string, fields?: LogFields) => log('info', msg, fields),
  warn: (msg: string, fields?: LogFields) => log('warn', msg, fields),
  error: (msg: string, fields?: LogFields) => log('error', msg, fields),
};
