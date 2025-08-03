// middleware/cacheControl.js
export const preventCache = (req, res, next) => {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    next();
};

// Enable caching for static data that changes infrequently
export const enableCache = (maxAge = 3600) => {
    return (req, res, next) => {
        res.set({
            'Cache-Control': `public, max-age=${maxAge}`,
            'Expires': new Date(Date.now() + maxAge * 1000).toUTCString()
        });
        next();
    };
};