import { useState } from 'react';
import { z } from 'zod';

// Zod schemas for validation
export const urlSchema = z
  .string()
  .url('Format URL tidak valid')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    'URL harus menggunakan protokol HTTP atau HTTPS'
  );

export const landingPageConfigSchema = z.object({
  active_lp: z
    .string()
    .min(1, 'Landing page harus dipilih')
    .regex(/^LP-\d+$/, 'Format landing page tidak valid'),

  google_ads_link: z
    .string()
    .optional()
    .refine(
      (val) => !val || urlSchema.safeParse(val).success,
      'Link Google Ads tidak valid'
    ),

  tiktok_link: z
    .string()
    .optional()
    .refine(
      (val) => !val || urlSchema.safeParse(val).success,
      'Link TikTok tidak valid'
    ),

  custom_links: z
    .record(z.string().url('Setiap custom link harus berupa URL valid'))
    .optional(),
});

export type LandingPageConfigInput = z.infer<typeof landingPageConfigSchema>;

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

// Custom validation functions
export class ValidationService {
  // URL validation with additional checks
  static validateUrl(url: string): { isValid: boolean; error?: string } {
    try {
      const result = urlSchema.safeParse(url);
      if (!result.success) {
        return {
          isValid: false,
          error: result.error.errors[0]?.message || 'URL tidak valid',
        };
      }

      // Additional security checks
      const parsedUrl = new URL(url);
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(url))) {
        return {
          isValid: false,
          error: 'URL mengandung konten yang tidak aman',
        };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Format URL tidak valid' };
    }
  }

  // Landing page ID validation
  static validateLandingPageId(lpId: string): { isValid: boolean; error?: string } {
    if (!lpId) {
      return { isValid: false, error: 'Landing page harus dipilih' };
    }

    if (!/^LP-\d+$/.test(lpId)) {
      return { isValid: false, error: 'Format landing page tidak valid' };
    }

    const num = parseInt(lpId.split('-')[1]);
    if (num < 1 || num > 9) {
      return { isValid: false, error: 'Landing page harus antara LP-1 sampai LP-9' };
    }

    return { isValid: true };
  }

  // Comprehensive validation for landing page config
  static validateLandingPageConfig(data: Partial<LandingPageConfigInput>): ValidationResult {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    // Validate active_lp
    if (!data.active_lp) {
      errors.active_lp = ['Landing page harus dipilih'];
    } else {
      const lpValidation = this.validateLandingPageId(data.active_lp);
      if (!lpValidation.isValid) {
        errors.active_lp = [lpValidation.error!];
      }
    }

    // Validate Google Ads link
    if (data.google_ads_link) {
      const urlValidation = this.validateUrl(data.google_ads_link);
      if (!urlValidation.isValid) {
        errors.google_ads_link = [urlValidation.error!];
      } else {
        // Check if it's actually a Google Ads URL
        if (!data.google_ads_link.includes('google.com') &&
            !data.google_ads_link.includes('gclid') &&
            !data.google_ads_link.includes('utm_source=google')) {
          warnings.google_ads_link = ['URL tidak terdeteksi sebagai link Google Ads'];
        }
      }
    }

    // Validate TikTok link
    if (data.tiktok_link) {
      const urlValidation = this.validateUrl(data.tiktok_link);
      if (!urlValidation.isValid) {
        errors.tiktok_link = [urlValidation.error!];
      } else {
        // Check if it's actually a TikTok URL
        if (!data.tiktok_link.includes('tiktok.com') &&
            !data.tiktok_link.includes('utm_source=tiktok')) {
          warnings.tiktok_link = ['URL tidak terdeteksi sebagai link TikTok'];
        }
      }
    }

    // Validate custom links
    if (data.custom_links) {
      const customLinkErrors: string[] = [];
      const customLinkWarnings: string[] = [];

      Object.entries(data.custom_links).forEach(([key, url]) => {
        if (!url) {
          customLinkErrors.push(`${key}: URL tidak boleh kosong`);
          return;
        }

        const urlValidation = this.validateUrl(url);
        if (!urlValidation.isValid) {
          customLinkErrors.push(`${key}: ${urlValidation.error}`);
        } else {
          // Check for common issues
          if (url.length > 2000) {
            customLinkWarnings.push(`${key}: URL terlalu panjang`);
          }
        }
      });

      if (customLinkErrors.length > 0) {
        errors.custom_links = customLinkErrors;
      }
      if (customLinkWarnings.length > 0) {
        warnings.custom_links = customLinkWarnings;
      }
    }

    // Cross-field validation
    if (data.google_ads_link && data.tiktok_link) {
      if (data.google_ads_link === data.tiktok_link) {
        warnings.cross_field = ['Link Google Ads dan TikTok sama, pastikan ini benar'];
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  }

  // Sanitize input data
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .substring(0, 1000); // Limit length
  }

  // Validate and sanitize landing page config
  static validateAndSanitizeConfig(data: Partial<LandingPageConfigInput>): {
    sanitized: Partial<LandingPageConfigInput>;
    validation: ValidationResult;
  } {
    const sanitized: Partial<LandingPageConfigInput> = {
      active_lp: data.active_lp,
      google_ads_link: data.google_ads_link ? this.sanitizeInput(data.google_ads_link) : undefined,
      tiktok_link: data.tiktok_link ? this.sanitizeInput(data.tiktok_link) : undefined,
      custom_links: data.custom_links ? Object.fromEntries(
        Object.entries(data.custom_links).map(([key, value]) => [
          this.sanitizeInput(key),
          this.sanitizeInput(value)
        ])
      ) : undefined,
    };

    const validation = this.validateLandingPageConfig(sanitized);

    return { sanitized, validation };
  }
}

// React hook for form validation
export function useFormValidation<T>(
  schema: z.ZodSchema<T>,
  initialData: Partial<T> = {}
) {
  const [data, setData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [warnings, setWarnings] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: keyof T, value: any) => {
    // Simple validation - just check if field is required and empty
    const fieldName = field as string;
    const newErrors = { ...errors };

    if (!value && fieldName !== 'custom_links') {
      newErrors[fieldName] = [`${fieldName} harus diisi`];
    } else if (fieldName.includes('link') && value) {
      const urlValidation = ValidationService.validateUrl(value);
      if (!urlValidation.isValid) {
        newErrors[fieldName] = [urlValidation.error!];
      } else {
        delete newErrors[fieldName];
      }
    } else {
      delete newErrors[fieldName];
    }

    setErrors(newErrors);
  };

  const validateAll = (): boolean => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        error.errors.forEach(err => {
          const field = err.path[0] as string;
          if (!fieldErrors[field]) fieldErrors[field] = [];
          fieldErrors[field].push(err.message);
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const setFieldValue = (field: keyof T, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
    if (touched[field as string]) {
      validateField(field, value);
    }
  };

  const setFieldTouched = (field: keyof T) => {
    setTouched((prev: any) => ({ ...prev, [field as string]: true }));
    validateField(field, (data as any)[field]);
  };

  const reset = () => {
    setData(initialData);
    setErrors({});
    setWarnings({});
    setTouched({});
  };

  return {
    data,
    errors,
    warnings,
    touched,
    setFieldValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}