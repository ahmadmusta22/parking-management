/**
 * SEO utilities and structured data implementation
 */

// Meta tags management
export const metaTags = {
  // Set page title
  setTitle: (title) => {
    document.title = title;
    
    // Update Open Graph title
    metaTags.updateMetaTag('og:title', title);
    metaTags.updateMetaTag('twitter:title', title);
  },
  
  // Set meta description
  setDescription: (description) => {
    metaTags.updateMetaTag('description', description);
    metaTags.updateMetaTag('og:description', description);
    metaTags.updateMetaTag('twitter:description', description);
  },
  
  // Set canonical URL
  setCanonical: (url) => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  },
  
  // Update or create meta tag
  updateMetaTag: (property, content) => {
    let meta = document.querySelector(`meta[name="${property}"], meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      if (property.startsWith('og:') || property.startsWith('twitter:')) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', property);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  },
  
  // Set Open Graph tags
  setOpenGraph: (data) => {
    const defaults = {
      'og:type': 'website',
      'og:site_name': 'Parking Management System',
      'og:locale': 'en_US'
    };
    
    Object.entries({ ...defaults, ...data }).forEach(([key, value]) => {
      metaTags.updateMetaTag(key, value);
    });
  },
  
  // Set Twitter Card tags
  setTwitterCard: (data) => {
    const defaults = {
      'twitter:card': 'summary_large_image',
      'twitter:site': '@parkingapp'
    };
    
    Object.entries({ ...defaults, ...data }).forEach(([key, value]) => {
      metaTags.updateMetaTag(key, value);
    });
  }
};

// Structured data (JSON-LD)
export const structuredData = {
  // Organization schema
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Parking Management System',
    description: 'Smart parking solutions with real-time availability tracking',
    url: window.location.origin,
    logo: `${window.location.origin}/assets/img/logo.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-123-456-7890',
      contactType: 'customer service',
      availableLanguage: 'English'
    },
    sameAs: [
      'https://twitter.com/parkingapp',
      'https://linkedin.com/company/parkingapp'
    ]
  },
  
  // WebSite schema
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Parking Management System',
    url: window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${window.location.origin}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  },
  
  // WebApplication schema
  webApplication: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Parking Management System',
    description: 'Smart parking solutions with real-time availability tracking',
    url: window.location.origin,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  },
  
  // Breadcrumb schema
  breadcrumb: (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }),
  
  // FAQ schema
  faq: (questions) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    }))
  }),
  
  // LocalBusiness schema
  localBusiness: {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Parking Management System',
    description: 'Smart parking solutions for modern cities',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main Street',
      addressLocality: 'Plano',
      addressRegion: 'TX',
      postalCode: '75023',
      addressCountry: 'US'
    },
    telephone: '+1-123-456-7890',
    openingHours: 'Mo-Su 00:00-23:59',
    priceRange: '$$'
  }
};

// Add structured data to page
export const addStructuredData = (data) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

// Sitemap generation
export const generateSitemap = () => {
  const routes = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/login', priority: '0.6', changefreq: 'monthly' },
    { url: '/gate/gate_1', priority: '0.7', changefreq: 'weekly' },
    { url: '/gate/gate_2', priority: '0.7', changefreq: 'weekly' },
    { url: '/gate/gate_3', priority: '0.7', changefreq: 'weekly' },
    { url: '/gate/gate_4', priority: '0.7', changefreq: 'weekly' },
    { url: '/gate/gate_5', priority: '0.7', changefreq: 'weekly' }
  ];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${window.location.origin}${route.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return sitemap;
};

// Robots.txt generation
export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /checkpoint/
Disallow: /api/

Sitemap: ${window.location.origin}/sitemap.xml`;
};

// SEO optimization utilities
export const seoOptimization = {
  // Optimize images for SEO
  optimizeImages: () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading="lazy" for performance
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Ensure alt text exists
      if (!img.alt) {
        img.alt = 'Parking management system image';
      }
      
      // Add width and height attributes
      if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
    });
  },
  
  // Optimize headings for SEO
  optimizeHeadings: () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let h1Count = 0;
    
    headings.forEach(heading => {
      if (heading.tagName === 'H1') {
        h1Count++;
        if (h1Count > 1) {
          console.warn('Multiple H1 tags found. Consider using only one H1 per page.');
        }
      }
    });
  },
  
  // Add schema markup to forms
  addFormSchema: (formElement) => {
    const formSchema = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      mainEntity: {
        '@type': 'ContactForm',
        name: 'Contact Form'
      }
    };
    
    addStructuredData(formSchema);
  },
  
  // Generate meta tags for dynamic pages
  generatePageMeta: (pageData) => {
    const {
      title,
      description,
      keywords,
      image,
      url,
      type = 'website'
    } = pageData;
    
    // Set basic meta tags
    metaTags.setTitle(title);
    metaTags.setDescription(description);
    metaTags.setCanonical(url);
    
    // Set keywords
    if (keywords) {
      metaTags.updateMetaTag('keywords', keywords.join(', '));
    }
    
    // Set Open Graph
    metaTags.setOpenGraph({
      'og:title': title,
      'og:description': description,
      'og:url': url,
      'og:type': type,
      'og:image': image || `${window.location.origin}/assets/img/og-image.jpg`
    });
    
    // Set Twitter Card
    metaTags.setTwitterCard({
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image || `${window.location.origin}/assets/img/twitter-image.jpg`
    });
  }
};

// Analytics integration
export const analytics = {
  // Google Analytics 4
  initGA4: (measurementId) => {
    if (typeof window !== 'undefined' && measurementId) {
      // Load GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
      
      // Initialize GA4
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', measurementId);
    }
  },
  
  // Track page views
  trackPageView: (pagePath, pageTitle) => {
    if (window.gtag) {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pagePath,
        page_title: pageTitle
      });
    }
  },
  
  // Track events
  trackEvent: (eventName, parameters = {}) => {
    if (window.gtag) {
      gtag('event', eventName, parameters);
    }
  }
};

// Initialize SEO features
export const initializeSEO = () => {
  // Add organization structured data
  addStructuredData(structuredData.organization);
  
  // Add website structured data
  addStructuredData(structuredData.website);
  
  // Add web application structured data
  addStructuredData(structuredData.webApplication);
  
  // Add local business structured data
  addStructuredData(structuredData.localBusiness);
  
  // Optimize images and headings
  seoOptimization.optimizeImages();
  seoOptimization.optimizeHeadings();
  
  // Set default meta tags
  metaTags.setOpenGraph({
    'og:title': 'Parking Management System - Smart Parking Solutions',
    'og:description': 'Advanced parking management with real-time availability, automated check-in/out, and seamless user experience.',
    'og:url': window.location.href,
    'og:image': `${window.location.origin}/assets/img/og-image.jpg`
  });
  
  console.log('SEO features initialized');
};

// Page-specific SEO setup
export const setupPageSEO = (pageType, pageData = {}) => {
  const seoConfigs = {
    home: {
      title: 'Parking Management System - Smart Parking Solutions',
      description: 'Advanced parking management with real-time availability, automated check-in/out, and seamless user experience.',
      keywords: ['parking management', 'smart parking', 'automated parking', 'parking solutions']
    },
    about: {
      title: 'About Us - Parking Management System',
      description: 'Learn about our innovative parking management solutions and commitment to smart city infrastructure.',
      keywords: ['about parking system', 'company information', 'parking technology']
    },
    contact: {
      title: 'Contact Us - Parking Management System',
      description: 'Get in touch with our parking management team for support, inquiries, and business partnerships.',
      keywords: ['contact parking system', 'customer support', 'parking help']
    },
    gate: {
      title: `Gate ${pageData.gateId} - Parking Check-in`,
      description: `Access parking gate ${pageData.gateId} for quick and easy check-in to available parking zones.`,
      keywords: ['parking gate', 'check-in', 'parking access']
    }
  };
  
  const config = seoConfigs[pageType] || seoConfigs.home;
  seoOptimization.generatePageMeta({
    ...config,
    ...pageData,
    url: window.location.href
  });
  
  // Add breadcrumb for non-home pages
  if (pageType !== 'home') {
    const breadcrumbItems = [
      { name: 'Home', url: window.location.origin },
      { name: config.title, url: window.location.href }
    ];
    addStructuredData(structuredData.breadcrumb(breadcrumbItems));
  }
};
