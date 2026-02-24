import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCORSHeaders, checkRateLimit } from './_lib/utils';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const rateLimitResult = checkRateLimit(String(clientIP), '/api/analytics', 'API_HEAVY');
  
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
  }

  const gaCredentials = process.env.GA_SERVICE_ACCOUNT_KEY;
  const gaPropertyId = process.env.GA_PROPERTY_ID;

  if (!gaCredentials || !gaPropertyId) {
    console.error('GA4 credentials not configured');
    // Return fallback data
    const fallbackResponse = {
      period: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        days: 30
      },
      metrics: {
        totalUsers: 0,
        sessions: 0,
        pageViews: 0,
        bounceRate: '0.00',
        avgSessionDuration: '0.00'
      },
      charts: {
        pageViews: [],
        topPages: [],
        trafficSources: [],
        demographics: { age: [], gender: [] },
        geography: { countries: [], cities: [] }
      },
      lastUpdated: new Date().toISOString(),
      note: 'Analytics not configured - Set GA_SERVICE_ACCOUNT_KEY and GA_PROPERTY_ID'
    };
    return res.status(200).json(fallbackResponse);
  }

  try {
    // Get date range from query params
    const days = parseInt(req.query?.days || '30');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`📊 Fetching GA4 data for ${gaPropertyId}: ${startDateStr} to ${endDateStr}`);

    // Parse service account key
    let serviceAccountKey;
    try {
      serviceAccountKey = JSON.parse(gaCredentials);
    } catch (parseError) {
      throw new Error('Invalid GA_SERVICE_ACCOUNT_KEY format');
    }

    // For Vercel, we need to use Google Auth library
    // Note: This requires the googleapis package
    const { google } = await import('googleapis');

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    // Fetch basic metrics
    const [pageViewsReport, topPagesReport, trafficSourcesReport, realtimeReport] = await Promise.all([
      analyticsData.properties.runReport({
        property: `properties/${gaPropertyId}`,
        requestBody: {
          dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }]
        }
      }),
      analyticsData.properties.runReport({
        property: `properties/${gaPropertyId}`,
        requestBody: {
          dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 10
        }
      }),
      analyticsData.properties.runReport({
        property: `properties/${gaPropertyId}`,
        requestBody: {
          dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
          dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
        }
      }),
      analyticsData.properties.runReport({
        property: `properties/${gaPropertyId}`,
        requestBody: {
          dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
          metrics: [
            { name: 'totalUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' }
          ]
        }
      })
    ]);

    // Process data
    const pageViewsData = pageViewsReport.data.rows?.map(row => ({
      date: row.dimensionValues?.[0]?.value,
      views: parseInt(row.metricValues?.[0]?.value || '0')
    })) || [];

    const topPagesData = topPagesReport.data.rows?.map(row => ({
      page: row.dimensionValues?.[0]?.value,
      views: parseInt(row.metricValues?.[0]?.value || '0')
    })) || [];

    const trafficSourcesData = trafficSourcesReport.data.rows?.map(row => ({
      name: row.dimensionValues?.[0]?.value,
      value: parseInt(row.metricValues?.[0]?.value || '0')
    })) || [];

    const metrics = realtimeReport.data.rows?.[0]?.metricValues || [];
    const basicMetrics = {
      totalUsers: parseInt(metrics[0]?.value || '0'),
      sessions: parseInt(metrics[1]?.value || '0'),
      pageViews: parseInt(metrics[2]?.value || '0'),
      bounceRate: parseFloat(metrics[3]?.value || '0').toFixed(2),
      avgSessionDuration: parseFloat(metrics[4]?.value || '0').toFixed(2)
    };

    const analyticsResponse = {
      period: {
        startDate: startDateStr,
        endDate: endDateStr,
        days: days
      },
      metrics: basicMetrics,
      charts: {
        pageViews: pageViewsData,
        topPages: topPagesData,
        trafficSources: trafficSourcesData,
        demographics: { age: [], gender: [] },
        geography: { countries: [], cities: [] }
      },
      lastUpdated: new Date().toISOString()
    };

    console.log(`✅ Analytics data fetched successfully for ${days} days`);

    return res.status(200).json(analyticsResponse);

  } catch (error) {
    console.error('Analytics API error:', error);
    
    const fallbackResponse = {
      period: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        days: 30
      },
      metrics: {
        totalUsers: 0,
        sessions: 0,
        pageViews: 0,
        bounceRate: '0.00',
        avgSessionDuration: '0.00'
      },
      charts: {
        pageViews: [],
        topPages: [],
        trafficSources: [],
        demographics: { age: [], gender: [] },
        geography: { countries: [], cities: [] }
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      lastUpdated: new Date().toISOString()
    };

    return res.status(200).json(fallbackResponse);
  }
}
