# Rate Limit Improvements

## Overview
This document outlines the rate limit improvements made to resolve rate limiting issues and improve application performance and security.

## Issues Fixed

### 1. **Backend Rate Limits Too Restrictive**
**Problem:** 
- General rate limit was only 100 requests per 15 minutes (6.7 req/min)
- Single page loads could trigger multiple API calls, causing users to hit limits quickly
- No differentiation between different types of endpoints

**Solution:**
- Increased general rate limit to **500 requests per 15 minutes** (33 req/min)
- Added endpoint-specific rate limits for better control
- Excluded static assets from rate limiting

### 2. **Google Maps API Key Security**
**Problem:**
- API key was hardcoded in frontend code
- Exposed in browser source code (security risk)
- Could hit Google's rate limits if abused

**Solution:**
- Moved API key to environment variables
- Added fallback for development
- Easy to rotate keys without code changes

## New Rate Limit Configuration

### General API Limits
```
Endpoint: All routes (default)
Limit: 500 requests per 15 minutes
Rate: ~33 requests per minute
Skip: Static assets (/uploads/*)
```

### Authentication Limits
```
Endpoint: /api/auth/login, /api/auth/register
Limit: 20 attempts per 15 minutes
Rate: ~1.3 attempts per minute
Feature: Skip counting successful requests
Purpose: Prevent brute force attacks
```

### Upload Limits
```
Endpoint: /api/uploads/*
Limit: 50 uploads per hour
Rate: ~0.8 uploads per minute
Purpose: Prevent abuse and server overload
```

### Search Limits
```
Endpoint: /api/rooms/search
Limit: 30 searches per minute
Rate: 30 searches per minute
Purpose: Prevent database query abuse
```

## Environment Variables

### Frontend (.env)
Add the following to your `.env.local` file:

```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
```

### How to Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Maps Embed API**
4. Go to Credentials → Create Credentials → API Key
5. **IMPORTANT:** Restrict the API key:
   - Application restrictions: HTTP referrers
   - Add your domains (e.g., `thakajabe.com/*`, `localhost:3000/*`)
   - API restrictions: Select "Maps Embed API"
6. Copy the API key to your `.env.local` file

### Security Best Practices
- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Use different API keys for development and production
- ✅ Set up billing alerts in Google Cloud Console
- ✅ Regularly rotate API keys
- ✅ Monitor API usage in Google Cloud Console

## Testing Rate Limits

### Test General Limit
```bash
# Should allow 500 requests in 15 minutes
for i in {1..550}; do
  curl http://localhost:8080/api/rooms
  echo "Request $i"
  sleep 1
done
```

### Test Auth Limit
```bash
# Should block after 20 attempts in 15 minutes
for i in {1..25}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo "Attempt $i"
  sleep 1
done
```

### Expected Responses

**When Rate Limited:**
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

## Monitoring Rate Limits

### Backend Logs
Monitor your server logs for rate limit hits:
```bash
tail -f logs/server.log | grep "rate limit"
```

### Headers
Check rate limit headers in responses:
```
RateLimit-Limit: 500
RateLimit-Remaining: 499
RateLimit-Reset: 1699999999
```

## Adjusting Limits

To modify rate limits, edit `thaka_jabe-server/src/index.ts`:

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // Time window
  max: 500,                   // Max requests
  // ... other options
});
```

### Recommended Limits by Traffic

**Low Traffic (< 100 users/day):**
- General: 500/15min
- Auth: 20/15min
- Uploads: 50/hour

**Medium Traffic (100-1000 users/day):**
- General: 1000/15min
- Auth: 30/15min
- Uploads: 100/hour

**High Traffic (> 1000 users/day):**
- General: 2000/15min
- Auth: 50/15min
- Uploads: 200/hour
- Consider implementing Redis for distributed rate limiting

## Benefits

### For Users
✅ Better experience - no more unexpected "too many requests" errors
✅ Faster page loads - static assets not rate limited
✅ Fair usage - limits are reasonable for normal usage

### For Security
✅ Prevents brute force attacks on login/registration
✅ Prevents upload abuse
✅ Protects database from excessive queries
✅ API keys now secure in environment variables

### For Performance
✅ Reduced server load from malicious traffic
✅ Better resource allocation
✅ Easier to scale with demand

## Troubleshooting

### Users Still Getting Rate Limited

1. **Check if IP is shared** (office/public WiFi):
   - Consider implementing user-based rate limiting (requires authentication)

2. **Check for bot traffic**:
   - Review server logs for unusual patterns
   - Consider adding CAPTCHA for public endpoints

3. **Legitimate high usage**:
   - Increase limits for specific endpoints
   - Implement tiered rate limiting (premium users get higher limits)

### Google Maps Not Loading

1. **Check API key**:
   ```bash
   echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   ```

2. **Verify API is enabled** in Google Cloud Console

3. **Check browser console** for errors

4. **Verify domain restrictions** match your domain

## Next Steps

### Recommended Improvements

1. **Implement Redis-based rate limiting** for distributed systems:
   ```bash
   npm install rate-limit-redis ioredis
   ```

2. **Add monitoring dashboard** to track rate limit hits

3. **Implement user-specific rate limits** for authenticated users

4. **Set up alerts** for unusual rate limit patterns

5. **Consider API versioning** for better control

## Support

For issues or questions:
- Check server logs: `thaka_jabe-server/logs/`
- Review this document
- Test with reduced limits locally first
- Monitor Google Cloud Console for Maps API usage

---

**Last Updated:** November 12, 2025
**Version:** 1.0


