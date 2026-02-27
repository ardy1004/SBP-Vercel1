/**
 * Meta Conversions API Server-Side Endpoint
 * 
 * This API route handles server-side events sent to Meta's Conversions API.
 * It NEVER connects to CAPI from the browser - only this server endpoint does.
 * 
 * Endpoint: POST /api/meta-capi
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Meta Pixel ID - using active pixel from Meta Events Manager
const META_PIXEL_ID = '1195412375706626';

// Graph API version
const GRAPH_API_VERSION = 'v18.0';

interface CapiEvent {
  event_name: string;
  event_id?: string;
  event_time: number;
  action_source: string;
  custom_data?: Record<string, any>;
  user_data?: {
    fbc?: string;
    fbp?: string;
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    country?: string;
  };
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // Get access token from environment
  const accessToken = process.env.META_CAPI_TOKEN;
  
  if (!accessToken) {
    console.error('META_CAPI_TOKEN not configured');
    return response.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const body = request.body as CapiEvent;
    
    // Validate required fields
    if (!body.event_name) {
      return response.status(400).json({ error: 'Missing event_name' });
    }

    // Prepare the event payload for Meta's Conversions API
    const eventPayload = {
      data: [
        {
          event_name: body.event_name,
          event_time: body.event_time || Math.floor(Date.now() / 1000),
          action_source: body.action_source || 'WEBSITE',
          event_id: body.event_id,
          custom_data: body.custom_data || {},
          user_data: body.user_data || {},
        }
      ],
    };

    // Send to Meta's Conversions API
    const metaUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${accessToken}`;
    
    const metaResponse = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    const metaResult = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error('Meta CAPI error:', metaResult);
      return response.status(metaResponse.status).json({ 
        error: 'Failed to send to Meta',
        details: metaResult 
      });
    }

    console.log('CAPI event sent successfully:', {
      eventName: body.event_name,
      eventId: body.event_id,
      result: metaResult
    });

    return response.status(200).json({ 
      success: true, 
      event_id: body.event_id,
      fbtrace_id: metaResult.fbtrace_id 
    });

  } catch (error) {
    console.error('Error in CAPI handler:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
