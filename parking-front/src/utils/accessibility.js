/**
 * Accessibility utilities and helpers
 */

// ARIA live region for screen readers
export const createLiveRegion = () => {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
  document.body.appendChild(liveRegion);
  return liveRegion;
};

// Announce messages to screen readers
export const announceToScreenReader = (message) => {
  let liveRegion = document.getElementById('live-region');
  if (!liveRegion) {
    liveRegion = createLiveRegion();
    liveRegion.id = 'live-region';
  }
  liveRegion.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 1000);
};

// Focus management utilities
export const focusManagement = {
  // Trap focus within an element
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Restore focus to previous element
  restoreFocus: (previousElement) => {
    if (previousElement && typeof previousElement.focus === 'function') {
      previousElement.focus();
    }
  },

  // Skip to main content
  skipToMain: () => {
    const mainContent = document.querySelector('main') || document.querySelector('#main');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  }
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Handle arrow key navigation for lists
  handleArrowKeys: (event, items, currentIndex, setCurrentIndex) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        event.preventDefault();
        setCurrentIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setCurrentIndex(items.length - 1);
        break;
    }
  },

  // Handle escape key
  handleEscape: (event, callback) => {
    if (event.key === 'Escape') {
      callback();
    }
  },

  // Handle enter and space keys
  handleActivation: (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }
};

// Color contrast utilities
export const colorContrast = {
  // Calculate relative luminance
  getLuminance: (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio: (color1, color2) => {
    const lum1 = colorContrast.getLuminance(...color1);
    const lum2 = colorContrast.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG standards
  meetsWCAG: (color1, color2, level = 'AA') => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    const standards = {
      AA: 4.5,
      AAA: 7
    };
    return ratio >= standards[level];
  }
};

// Screen reader utilities
export const screenReader = {
  // Hide element from screen readers
  hideFromScreenReader: (element) => {
    element.setAttribute('aria-hidden', 'true');
  },

  // Show element to screen readers
  showToScreenReader: (element) => {
    element.removeAttribute('aria-hidden');
  },

  // Provide screen reader description
  describeForScreenReader: (element, description) => {
    element.setAttribute('aria-describedby', description);
  },

  // Mark element as required
  markAsRequired: (element) => {
    element.setAttribute('aria-required', 'true');
  },

  // Mark element as invalid
  markAsInvalid: (element, message) => {
    element.setAttribute('aria-invalid', 'true');
    element.setAttribute('aria-describedby', message);
  }
};

// Form accessibility helpers
export const formAccessibility = {
  // Associate label with input
  associateLabel: (inputId, labelText) => {
    const label = document.createElement('label');
    label.setAttribute('for', inputId);
    label.textContent = labelText;
    return label;
  },

  // Create error message with proper ARIA
  createErrorMessage: (inputId, message) => {
    const errorId = `${inputId}-error`;
    const errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
    errorElement.textContent = message;
    return errorElement;
  },

  // Validate form accessibility
  validateFormAccessibility: (form) => {
    const issues = [];
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const id = input.id;
      const label = form.querySelector(`label[for="${id}"]`);
      
      if (!label && !input.getAttribute('aria-label')) {
        issues.push(`Input ${id} is missing a label`);
      }
      
      if (input.hasAttribute('required') && !input.getAttribute('aria-required')) {
        issues.push(`Required input ${id} should have aria-required="true"`);
      }
    });
    
    return issues;
  }
};

// Motion and animation preferences
export const motionPreferences = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Apply reduced motion styles
  applyReducedMotion: (element) => {
    if (motionPreferences.prefersReducedMotion()) {
      element.style.animation = 'none';
      element.style.transition = 'none';
    }
  },

  // Respect motion preferences in CSS
  getMotionCSS: () => {
    return `
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
  }
};

// Initialize accessibility features
export const initializeAccessibility = () => {
  // Add skip to main content link
  const skipLink = document.createElement('a');
  skipLink.href = '#main';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    transition: top 0.3s;
  `;
  
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Add main landmark if it doesn't exist
  if (!document.querySelector('main')) {
    const main = document.createElement('main');
    main.id = 'main';
    main.setAttribute('role', 'main');
    document.body.appendChild(main);
  }
  
  // Announce page load
  announceToScreenReader('Page loaded successfully');
};

// Accessibility testing utilities
export const accessibilityTesting = {
  // Check for common accessibility issues
  runBasicChecks: () => {
    const issues = [];
    
    // Check for missing alt text
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push(`Image missing alt text: ${img.src}`);
      }
    });
    
    // Check for missing form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.id;
      const label = document.querySelector(`label[for="${id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        issues.push(`Input missing label: ${id}`);
      }
    });
    
    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push(`Heading hierarchy issue: ${heading.tagName} after h${previousLevel}`);
      }
      previousLevel = level;
    });
    
    return issues;
  }
};
