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
    
    // Remove debug button - multiple selectors
    const debugButton1 = document.querySelector('button[style*="position: fixed"][style*="top: 10px"][style*="right: 10px"]');
    if (debugButton1 && debugButton1.textContent === 'Debug') {
      debugButton1.remove();
    }
    
    const debugButton2 = document.querySelector('button[style*="z-index: 10001"]');
    if (debugButton2 && debugButton2.textContent === 'Debug') {
      debugButton2.remove();
    }
    
    // Remove any button with "Debug" text in top-right corner
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(btn => {
      if (btn.textContent === 'Debug' && 
          (btn.style.position === 'fixed' || 
           btn.style.zIndex === '10001' ||
           btn.style.top === '10px' ||
           btn.style.right === '10px')) {
        btn.remove();
      }
    });
  }
  
  // Run immediately and also on DOM ready
  removeDebugElements();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeDebugElements);
  }
  
  // Also run periodically to catch any dynamically added debug elements
  setInterval(removeDebugElements, 1000);
})();
