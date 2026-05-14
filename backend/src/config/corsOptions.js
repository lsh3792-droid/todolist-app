const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGIN,
  methods: process.env.CORS_METHODS
    ? process.env.CORS_METHODS.split(',').map((m) => m.trim())
    : ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS
    ? process.env.CORS_ALLOWED_HEADERS.split(',').map((h) => h.trim())
    : ['Content-Type', 'Authorization'],
};

module.exports = { corsOptions };
