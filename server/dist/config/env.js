import 'dotenv/config';
import { z } from 'zod';
const booleanString = z.preprocess((value) => {
    if (typeof value === 'boolean')
        return value;
    if (typeof value !== 'string')
        return value;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes')
        return true;
    if (normalized === 'false' || normalized === '0' || normalized === 'no')
        return false;
    return value;
}, z.boolean());
const schema = z
    .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(4000),
    RENDER_EXTERNAL_URL: z.string().url().optional(),
    CLIENT_URLS: z.string().optional(),
    SERVE_CLIENT: booleanString.default(false),
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().optional(),
    REDIS_URL: z.string().min(1),
    JWT_SECRET: z.string().min(12),
    GITHUB_CLIENT_ID: z.string().default(''),
    GITHUB_CLIENT_SECRET: z.string().default(''),
    GITHUB_CALLBACK_URL: z.string().optional(),
})
    .transform((raw) => {
    const clientUrls = raw.CLIENT_URLS?.trim() || raw.RENDER_EXTERNAL_URL || 'http://localhost:5173';
    const githubCallbackUrl = raw.GITHUB_CALLBACK_URL?.trim() ||
        (raw.RENDER_EXTERNAL_URL ? `${raw.RENDER_EXTERNAL_URL}/api/auth/github/callback` : 'http://localhost:4000/api/auth/github/callback');
    return {
        ...raw,
        CLIENT_URLS: clientUrls,
        DIRECT_URL: raw.DIRECT_URL?.trim() || raw.DATABASE_URL,
        GITHUB_CALLBACK_URL: githubCallbackUrl,
    };
});
export const env = schema.parse(process.env);
