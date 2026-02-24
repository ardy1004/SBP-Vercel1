import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCORSHeaders, checkRateLimit, getEnvVar } from './_lib/utils';
import formidable from 'formidable';
import fs from 'fs';

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const rateLimitResult = checkRateLimit(String(clientIP), '/upload', 'IMAGE_UPLOAD');
  
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
  }

  const cfAccountId = getEnvVar('CF_ACCOUNT_ID');
  const cfImagesToken = getEnvVar('CF_IMAGES_TOKEN');

  if (!cfAccountId || !cfImagesToken) {
    console.error('Cloudflare Images configuration missing');
    return res.status(500).json({ 
      error: 'Image upload service not configured',
      details: 'Missing CF_ACCOUNT_ID or CF_IMAGES_TOKEN'
    });
  }

  try {
    // Parse form data using formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      allowEmptyFiles: false,
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.image?.[0];
    const propertyId = fields.propertyId?.[0];

    if (!file || !propertyId) {
      return res.status(400).json({ error: 'Missing file or propertyId' });
    }

    console.log('Received file for upload:', {
      name: file.originalFilename,
      size: file.size,
      type: file.mimetype,
      propertyId
    });

    // Validate file size
    if (file.size === 0) {
      return res.status(400).json({ error: 'File is empty' });
    }

    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Read file
    const fileBuffer = fs.readFileSync(file.filepath);

    // Upload to Cloudflare Images
    const cfFormData = new FormData();
    const blob = new Blob([fileBuffer], { type: file.mimetype });
    cfFormData.append('file', blob, file.originalFilename);
    cfFormData.append('requireSignedURLs', 'false');

    const cfImagesResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfImagesToken}`,
        },
        body: cfFormData as any,
      }
    );

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    if (!cfImagesResponse.ok) {
      const errorData = await cfImagesResponse.json();
      console.error('Cloudflare Images upload failed:', errorData);
      return res.status(500).json({ 
        error: 'Image upload failed', 
        details: errorData.errors?.[0]?.message || 'Unknown error' 
      });
    }

    const cfResult = await cfImagesResponse.json();
    const imageId = cfResult.result.id;

    console.log('Image uploaded to Cloudflare Images:', imageId);

    // Generate URLs
    const imageUrl = `https://imagedelivery.net/${cfAccountId}/${imageId}/public`;
    const variants = {
      thumbnail: `https://imagedelivery.net/${cfAccountId}/${imageId}/w=300,sharpen=1,format=auto`,
      small: `https://imagedelivery.net/${cfAccountId}/${imageId}/w=600,sharpen=1,format=auto`,
      medium: `https://imagedelivery.net/${cfAccountId}/${imageId}/w=800,sharpen=1,format=auto`,
      large: `https://imagedelivery.net/${cfAccountId}/${imageId}/w=1200,sharpen=1,format=auto`,
      original: imageUrl
    };

    return res.status(200).json({
      success: true,
      url: variants.medium,
      originalUrl: variants.original,
      variants,
      propertyId,
      imageId,
      metadata: {
        propertyId,
        uploadedAt: new Date().toISOString(),
        originalName: file.originalFilename,
        fileSize: file.size
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
