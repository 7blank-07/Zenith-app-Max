# WebP browser detection
map $http_accept $webp_suffix {
    default "";
    "~*webp" ".webp";
}

server {
    listen 80;
    listen [::]:80;
    server_name images.zenithfcm.com;

    # HTTP to HTTPS redirect
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name images.zenithfcm.com;

    root /var/www/images.zenithfcm.com;

    # SSL Configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/images.zenithfcm.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/images.zenithfcm.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers (applied globally)
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Prevent access to hidden files (highest priority)
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
        return 404;
    }

    # WebP-aware handling for PNG/JPG/JPEG requests
    location ~* ^(.+)\.(png|jpg|jpeg)$ {
        set $base $1;
        # CORS Headers - CRITICAL for squad export canvas to work
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Range' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length, Content-Range' always;
        add_header Vary Accept always;

        # Handle CORS preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Range';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Try serving the webp version if accepted, otherwise fallback to the original image
        try_files $base$webp_suffix $uri =404;

        # Aggressive caching (1 year - images are immutable)
        expires 365d;
        add_header Cache-Control "public, immutable, max-age=31536000" always;

        access_log off;
    }

    # Direct WebP / other image formats
    location ~* \.(webp|gif|svg|ico)$ {
        # CORS Headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Range' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length, Content-Range' always;
        add_header Vary Accept always;

        # Handle CORS preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Range';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        expires 365d;
        add_header Cache-Control "public, immutable, max-age=31536000" always;

        # Enable gzip compression for SVG
        gzip on;
        gzip_vary on;
        gzip_comp_level 6;
        gzip_types image/svg+xml;

        access_log off;
    }

    # Main location block for serving extensionless files too
    location / {
        # CORS Headers - CRITICAL for squad export canvas to work
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Range' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length, Content-Range' always;
        add_header Vary Accept always;

        # Handle CORS preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Range';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Try exact filename first, then common image extensions
        try_files $uri $uri.png $uri.jpg $uri.jpeg $uri.webp $uri.gif =404;

        # Aggressive caching (1 year - images are immutable)
        expires 365d;
        add_header Cache-Control "public, immutable, max-age=31536000" always;

        access_log off;
    }

    # Disable general logging for performance (only log errors)
    access_log off;
    error_log /var/log/nginx/images_error.log error;

    # Buffer settings for large images
    client_body_buffer_size 1M;
    client_max_body_size 10M;
}

