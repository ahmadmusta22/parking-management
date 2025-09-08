// Ultra-early console suppression - this runs before any other JavaScript
(function() {
  'use strict';
  
  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
    trace: console.trace,
    table: console.table,
    group: console.group,
    groupEnd: console.groupEnd,
    groupCollapsed: console.groupCollapsed,
    time: console.time,
    timeEnd: console.timeEnd,
    count: console.count,
    clear: console.clear,
    dir: console.dir,
    dirxml: console.dirxml,
    assert: console.assert,
    profile: console.profile,
    profileEnd: console.profileEnd,
    timeStamp: console.timeStamp,
    markTimeline: console.markTimeline,
    timeline: console.timeline,
    timelineEnd: console.timelineEnd
  };
  
  // Override all console methods
  const noop = function() {};
  
  console.log = noop;
  console.warn = noop;
  console.error = noop;
  console.info = noop;
  console.debug = noop;
  console.trace = noop;
  console.table = noop;
  console.group = noop;
  console.groupEnd = noop;
  console.groupCollapsed = noop;
  console.time = noop;
  console.timeEnd = noop;
  console.count = noop;
  console.clear = noop;
  console.dir = noop;
  console.dirxml = noop;
  console.assert = noop;
  console.profile = noop;
  console.profileEnd = noop;
  console.timeStamp = noop;
  console.markTimeline = noop;
  console.timeline = noop;
  console.timelineEnd = noop;
  
  // Also override window.console
  if (typeof window !== 'undefined') {
    window.console = console;
  }
  
  // Override global console
  if (typeof global !== 'undefined') {
    global.console = console;
  }
  
  // Make restore function available globally
  window.restoreConsole = function() {
    Object.keys(originalConsole).forEach(key => {
      console[key] = originalConsole[key];
    });
  };
  
  // Remove any debug elements immediately
  function removeDebugElements() {
    // Remove debug panel
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
      debugPanel.remove();
    }
    
    // Remove debug button
    const debugButton = document.querySelector('button[style*="position: fixed"][style*="top: 10px"][style*="right: 10px"]');
    if (debugButton && debugButton.textContent === 'Debug') {
      debugButton.remove();
    }
  }
  
  // Run immediately and also on DOM ready
  removeDebugElements();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeDebugElements);
  }
})();
