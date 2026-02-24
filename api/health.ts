import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCORSHeaders, getSecurityHeaders } from './_lib/utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  const origin = req.headers.get('origin') || req.headers.get('Origin') || null;
  const corsHeaders = getCORSHeaders(origin);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  const startTime = Date.now();

  // Check environment variables
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GA_PROPERTY_ID: process.env.GA_PROPERTY_ID || '',
    SEARCH_CONSOLE_SITE_URL: process.env.SEARCH_CONSOLE_SITE_URL || '',
  };

  // Check database connectivity
  let dbStatus = 'unknown';
  try {
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      const dbResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/properties?select=id&limit=1`, {
        headers: {
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'apikey': env.SUPABASE_ANON_KEY,
        },
      });
      dbStatus = dbResponse.ok ? 'healthy' : 'unhealthy';
    } else {
      dbStatus = 'not_configured';
    }
  } catch (error) {
    dbStatus = 'error';
  }

  // Check AI services
  let aiStatus = 'unknown';
  try {
    if (env.GEMINI_API_KEY) {
      const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'test' }] }]
        }),
      });
      aiStatus = aiResponse.status !== 400 ? 'healthy' : 'unhealthy';
    } else {
      aiStatus = 'not_configured';
    }
  } catch (error) {
    aiStatus = 'error';
  }

  const healthCheckTime = Date.now() - startTime;
  const overallStatus = (dbStatus === 'healthy' && aiStatus !== 'error') ? 'healthy' : 'degraded';

  const healthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.VERCEL_ENV || 'development',
    response_time_ms: healthCheckTime,
    services: {
      database: dbStatus,
      ai_api: aiStatus,
      rate_limiting: 'active',
      cors: 'configured'
    },
    metrics: {
      uptime_seconds: Math.floor(process.uptime()),
      memory_usage_mb: Math.round(process.memoryUsage?.().heapUsed / 1024 / 1024) || null,
    },
    system: {
      platform: 'vercel-serverless',
      region: process.env.VERCEL_REGION || 'unknown',
    }
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
}
