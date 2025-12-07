import * as crypto from 'crypto';
import * as express from 'express';
import NodeCache from 'node-cache';

interface RequestWithBody extends express.Request {
    body: any; // Use 'any' or a specific type for the request body if known (e.g., ReportFilters)
}

/**
 * Generates a unique, deterministic SHA-256 hash for a JSON object.
 * This is used as the cache key for POST requests.
 * @param body The request body object.
 */
const generateBodyHash = (body: any): string => {
    // 1. Sort the keys to ensure the stringified output is always the same.
    const sortedKeys = Object.keys(body).sort();
    const stringifiedBody = JSON.stringify(body, sortedKeys);
    
    // 2. Create and return the hash digest.
    return crypto.createHash('sha256').update(stringifiedBody).digest('hex');
};

/**
 * Determines the unique cache key for the request.
 * - GET requests use the URL.
 * - POST requests use a prefix + URL + hash of the request body.
 * @param req The Express Request object.
 */
export const getCacheKey = (req: RequestWithBody): string => {
    const baseUrl = req.originalUrl || req.url;

    if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
        // Key format: POST_[URL]_[BODY_HASH]
        return `POST_CACHE_${baseUrl}_${generateBodyHash(req.body)}`;
    }
    
    // For GET/other methods, the key is the full request path
    return baseUrl;
};

/**
 * Creates and returns a complete cache middleware instance configured with a specific TTL.
 * * IMPORTANT: If using POST caching, ensure 'express.json()' or a similar body-parser 
 * runs BEFORE the returned middleware to populate req.body.
 * * @param ttlSeconds The Time-To-Live for cached data in seconds.
 * @returns The Express middleware function.
 */
export const createCacheMiddleware = (ttlSeconds: number): express.Handler => {
    if (typeof ttlSeconds !== 'number' || ttlSeconds <= 0) {
        throw new Error("TTL must be a positive number of seconds.");
    }
    
    // Create a new, dedicated cache store for this TTL instance
    // Note: NodeCache is generic, so we specify <string, string> for key and value types
    const cacheStore = new NodeCache({ stdTTL: ttlSeconds, checkperiod: 60 });
    console.log(`[Cache Config] New cache instance created with TTL: ${ttlSeconds}s`);

    // This is the actual Express middleware function that gets returned and used
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // Cast the request to our extended type to safely access req.body
        const typedReq = req as RequestWithBody;
        const key = getCacheKey(typedReq);
        
        // Ensure we only cache successful GET and POST requests
        if (req.method !== 'GET' && req.method !== 'POST') {
             return next();
        }

        const cachedBody = cacheStore.get<string>(key);

        if (cachedBody) {
            console.log(`[Cache Hit - ${ttlSeconds}s TTL] Key: ${key}`);
            return res.status(200).send(JSON.parse(cachedBody));
        } else {
            console.log(`[Cache Miss - ${ttlSeconds}s TTL] Key: ${key}`);
            
            // Store the original res.send function
            const originalSend = res.send;
            
            // Override the response function
            res.send = function (this: express.Response, body: any) {
                
                // Only cache successful responses (HTTP 200, 201, etc.)
                if (this.statusCode >= 200 && this.statusCode < 300) { // Note: 'this' is used here to access statusCode
                    const bodyToCache = typeof body === 'string' ? body : JSON.stringify(body);
                    cacheStore.set(key, bodyToCache);
                }
                
                // Call the original function, ensuring its 'this' context (the response object) is correct
                originalSend.call(this, body); 
                
                // Clean up
                res.send = originalSend;
            } as any;

            next();
        }
    };
};