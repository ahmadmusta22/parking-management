/**
 * Console suppression utility
 * This will suppress all console output in development mode
 */

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

// Override console methods to suppress output immediately
console.log = () => {};
console.warn = () => {};
console.error = () => {};
console.info = () => {};
console.debug = () => {};
console.trace = () => {};
console.table = () => {};
console.group = () => {};
console.groupEnd = () => {};
console.groupCollapsed = () => {};
console.time = () => {};
console.timeEnd = () => {};
console.count = () => {};
console.clear = () => {};

// Export function to restore console if needed
export const restoreConsole = () => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
};

// Export function to suppress console
export const suppressConsole = () => {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
};
