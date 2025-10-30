# Easy Freight Customs Clearance Form - Deployment Guide

## Project Overview
Multi-step customs clearance quote form with intelligent routing, document upload, pricing calculation, and responsive design. Built with vanilla HTML, CSS, and JavaScript for easy deployment on any web server.

## Deployment Requirements

### Technical Requirements
- **Web Server**: Any static web server (Apache, Nginx, IIS, etc.)
- **Browser Support**: Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- **CDN Dependencies**: Internet connection required for external resources
- **File Structure**: All files must maintain relative path structure

### Server Requirements
- **Minimum**: Basic static file hosting
- **Recommended**: HTTPS enabled server for production
- **Storage**: ~50KB total file size
- **Bandwidth**: Minimal (form is client-side only)

## File Structure

```
easy-freight-form/
├── index.html              # Main HTML structure
├── css/
│   └── style.css          # Complete styling with CSS custom properties
├── js/
│   └── app.js             # Form logic, validation, and calculations
├── README.md              # Project documentation
└── deployment.md          # This deployment guide
```

## External Dependencies (CDN)

### Required CDN Links
Include these in the HTML `<head>` section:

```html
<!-- Font Awesome Icons (Required) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Google Fonts - Inter (Required) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<!-- Tailwind CSS (Optional - for utilities) -->
<script src="https://cdn.tailwindcss.com"></script>
```

### CDN Fallback Strategy
For production environments, consider hosting these dependencies locally:

1. **Download Font Awesome** and host locally
2. **Download Inter font files** and serve from your domain
3. **Remove Tailwind** if not using utility classes

## Deployment Methods

### Method 1: Static Web Hosting Services

#### Netlify Deployment
1. **Prepare files**:
   ```bash
   # Create deployment folder
   mkdir easy-freight-form
   cd easy-freight-form
   
   # Copy all files maintaining structure
   cp index.html .
   cp -r css/ .
   cp -r js/ .
   ```

2. **Deploy to Netlify**:
   - Drag and drop the folder to Netlify
   - Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=.
   ```

#### Vercel Deployment
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd easy-freight-form
   vercel --prod
   ```

#### GitHub Pages
1. **Create repository** with all files
2. **Enable Pages** in repository settings
3. **Set source** to main branch / root directory

### Method 2: Traditional Web Server

#### Apache Configuration
1. **Upload files** to web root directory
2. **Configure .htaccess** (optional):
   ```apache
   # Force HTTPS (recommended)
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   
   # Caching headers for static assets
   <IfModule mod_expires.c>
       ExpiresActive On
       ExpiresByType text/css "access plus 1 month"
       ExpiresByType application/javascript "access plus 1 month"
   </IfModule>
   ```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/easy-freight-form;
    index index.html;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Caching for static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }

    # Main application
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Method 3: CDN Deployment

#### Cloudflare Pages
1. **Connect GitHub repository**
2. **Build settings**:
   - Build command: (none - static files)
   - Build output directory: `/`
3. **Environment variables**: None required

#### AWS S3 + CloudFront
1. **Create S3 bucket**:
   ```bash
   aws s3 mb s3://easy-freight-form-bucket
   aws s3 sync . s3://easy-freight-form-bucket --delete
   ```

2. **Configure bucket for web hosting**:
   ```bash
   aws s3 website s3://easy-freight-form-bucket --index-document index.html
   ```

3. **Create CloudFront distribution** for global CDN

## Configuration Options

### Environment-Specific Settings

#### Development Environment
```javascript
// In js/app.js - Development settings
const CONFIG = {
    DEBUG_MODE: true,
    API_BASE_URL: 'http://localhost:3000',
    FORM_SUBMIT_URL: '/api/submit',
    ENABLE_ANALYTICS: false
};
```

#### Production Environment
```javascript
// In js/app.js - Production settings
const CONFIG = {
    DEBUG_MODE: false,
    API_BASE_URL: 'https://api.easyfreight.co.nz',
    FORM_SUBMIT_URL: '/api/customs-quote',
    ENABLE_ANALYTICS: true
};
```

### Customization Options

#### Branding Customization
Update CSS custom properties in `css/style.css`:

```css
:root {
    /* Primary Brand Colors - Update these */
    --primary-color: #170a33;  /* Your brand primary */
    --primary-light: #2a1a4a;  /* Lighter variant */
    --primary-dark: #0f0622;   /* Darker variant */
    
    /* Background Colors */
    --bg-primary: #ffffff;     /* Main background */
    --bg-secondary: #f8f9fa;   /* Secondary background */
}
```

#### Form Field Customization
Modify field options in `js/app.js`:

```javascript
// Example: Add new cargo type
cargoTypeTemplate() {
    // Add new options to the cargo type list
    // Update validation logic accordingly
}

// Example: Modify pricing structure
calculatePricingEstimate() {
    let serviceTotal = 197; // Update base fee
    // Modify pricing logic as needed
}
```

## Integration Requirements

### Form Submission Integration

#### Backend API Requirements
The form expects a POST endpoint that accepts:

```json
{
    "contact": {
        "first_name": "string",
        "last_name": "string",
        "company_name": "string",
        "email": "string",
        "phone": "string"
    },
    "service": {
        "direction": "import|export",
        "customer_type": "business|personal",
        "cargo_type": "string",
        "shipping_details": "object"
    },
    "scores": {
        "urgency_score": "number",
        "complexity_score": "number",
        "readiness_score": "number",
        "routing_decision": "string"
    },
    "documents": "object",
    "timestamp": "ISO string"
}
```

#### Integration Points
1. **Form Submission**: Update `submitForm()` method in `js/app.js`
2. **Document Upload**: Implement file upload handler
3. **Email Notifications**: Backend should handle email sending
4. **CRM Integration**: Map form data to your CRM fields

### Analytics Integration

#### Google Analytics 4
Add to `index.html` before closing `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

#### Event Tracking
Add to `js/app.js`:

```javascript
// Track form events
function trackEvent(action, step) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': 'form',
            'event_label': step,
            'custom_map': {'custom_parameter': 'value'}
        });
    }
}

// Usage in form methods
nextStep() {
    trackEvent('step_completed', this.currentStep);
    // ... existing logic
}
```

## Security Considerations

### Content Security Policy (CSP)
Add to your server configuration or HTML meta tag:

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.tailwindcss.com https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
    font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.easyfreight.co.nz;
">
```

### Data Protection
1. **HTTPS Only**: Always serve over HTTPS in production
2. **Input Validation**: Implement server-side validation
3. **Rate Limiting**: Protect form submission endpoint
4. **Data Encryption**: Encrypt sensitive data in transit and at rest

## Performance Optimization

### Frontend Optimizations
1. **Minification**: Minify CSS and JavaScript for production
2. **Compression**: Enable gzip compression on server
3. **Caching**: Set appropriate cache headers
4. **CDN**: Use CDN for static assets

### Minification Commands
```bash
# CSS minification (using cleancss)
npx cleancss -o css/style.min.css css/style.css

# JavaScript minification (using terser)
npx terser js/app.js -o js/app.min.js -c -m

# Update HTML to reference minified files
```

### Image Optimization
If adding images later:
- Use WebP format with fallbacks
- Implement lazy loading
- Serve responsive images

## Testing & Validation

### Pre-Deployment Checklist
- [ ] All form steps navigate correctly
- [ ] Validation works on all required fields
- [ ] Conditional logic shows/hides appropriate fields
- [ ] Scoring calculations produce expected results
- [ ] Mobile responsiveness tested on various devices
- [ ] Cross-browser compatibility verified
- [ ] External CDN dependencies load correctly
- [ ] Form submission integrates with backend
- [ ] Analytics tracking functions properly

### Browser Testing
Test on:
- **Chrome** (latest 2 versions)
- **Firefox** (latest 2 versions)  
- **Safari** (latest 2 versions)
- **Edge** (latest 2 versions)
- **Mobile browsers** (iOS Safari, Chrome Mobile)

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- Color contrast compliance (WCAG 2.1 AA)
- Focus indicators visible

## Monitoring & Maintenance

### Error Monitoring
Implement error tracking:

```javascript
// Add to js/app.js
window.addEventListener('error', function(e) {
    // Log errors to your monitoring service
    console.error('Form Error:', e.error);
    
    // Optional: Send to error tracking service
    if (typeof errorTrackingService !== 'undefined') {
        errorTrackingService.captureException(e.error);
    }
});
```

### Performance Monitoring
- Monitor form completion rates
- Track step abandonment points
- Measure form load times
- Monitor CDN performance

### Regular Maintenance
1. **Update Dependencies**: Check for CDN updates monthly
2. **Security Updates**: Monitor for security advisories
3. **Content Updates**: Review form fields and options quarterly
4. **Performance Review**: Analyze metrics monthly

## Troubleshooting

### Common Issues

#### CDN Loading Issues
**Problem**: Font Awesome or Google Fonts not loading
**Solution**: 
- Check CDN URLs are current
- Verify CSP allows external domains
- Consider hosting fonts locally

#### Mobile Layout Issues
**Problem**: Form doesn't fit properly on mobile
**Solution**:
- Verify viewport meta tag is present
- Check CSS media queries are working
- Test on actual devices, not just browser dev tools

#### Form Validation Errors
**Problem**: Form allows submission with invalid data
**Solution**:
- Check validation logic in each step
- Verify required field checking
- Test edge cases with empty/null values

#### Scoring Calculation Errors
**Problem**: Routing decisions are incorrect
**Solution**:
- Verify scoring functions are called in correct order
- Check conditional logic for edge cases
- Add debugging logs to trace calculation flow

### Debug Mode
Enable debug mode for troubleshooting:

```javascript
// In js/app.js
const DEBUG_MODE = true; // Set to false for production

if (DEBUG_MODE) {
    console.log('Form Data:', this.formData);
    console.log('Scores:', {
        urgency: this.formData.urgency_score,
        complexity: this.formData.complexity_score,
        readiness: this.formData.readiness_score
    });
}
```

## Contact & Support

For deployment issues or questions:
- **Technical Issues**: Check browser console for errors
- **Integration Help**: Review API documentation
- **Performance Issues**: Use browser dev tools to profile
- **Customization**: Refer to code comments and documentation

## Version History

- **v1.0**: Initial release with basic form functionality
- **v1.1**: Added conditional logic and routing
- **v1.2**: Enhanced mobile responsiveness  
- **v1.3**: Added document upload system
- **v1.4**: Implemented pricing calculations
- **v1.5**: Added two-column layouts and spacing improvements
- **v1.6**: Final UI refinements and deployment preparation

---

**Last Updated**: 2024-01-15
**Deployment Version**: v1.6
**Status**: Production Ready