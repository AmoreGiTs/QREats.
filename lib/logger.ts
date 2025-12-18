// Simple logger wrapper to replace Pino for now due to build issues
// This can be enhanced or replaced with Pino later if configured correctly for Next.js 14+

const logger = {
  info: (msg: any) => console.log(JSON.stringify({ level: 'info', ...msg })),
  warn: (msg: any) => console.warn(JSON.stringify({ level: 'warn', ...msg })),
  error: (msg: any) => console.error(JSON.stringify({ level: 'error', ...msg })),
  debug: (msg: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({ level: 'debug', ...msg }));
    }
  },
};

export default logger;
