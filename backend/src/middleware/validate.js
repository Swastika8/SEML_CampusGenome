import { z } from 'zod';

export const categories = ['Academics', 'Career', 'Communities', 'Events', 'Lifestyle'];
const text = (max) => z.string().trim().min(1).max(max);
const webUrl = z
  .string()
  .max(2048)
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, 'Use a valid http or https URL.');
export const registerSchema = z.object({
  name: text(100),
  handle: z
    .string()
    .trim()
    .regex(/^@?[a-zA-Z0-9_]{3,30}$/, 'Use 3-30 letters, numbers or underscores.'),
  email: z
    .email()
    .max(150)
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8)
    .max(72)
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') <= 72,
      'Password must be at most 72 UTF-8 bytes.',
    ),
  department: text(100).optional(),
  graduationYear: z.coerce.number().int().min(2020).max(2100).optional(),
});
export const loginSchema = z.object({
  loginIdentifier: text(150),
  password: z.string().min(1).max(72),
});
export const nodeSchema = z
  .object({
    category: z.enum(categories),
    title: text(255),
    description: z.string().trim().min(15).max(10000),
    department: text(100).optional(),
    year: text(50).optional(),
    subject: text(150).optional(),
    eventDate: z.iso.date().optional(),
    eventTime: text(50).optional(),
    eventLocation: text(200).optional(),
    imageUrl: webUrl.optional(),
    spotName: text(150).optional(),
    location: text(200).optional(),
    secret: z.string().max(5000).optional(),
    tags: z.array(text(50)).max(10).optional(),
    domain: text(100).optional(),
    company: text(100).optional(),
    companyRole: text(100).optional(),
    opportunityType: text(100).optional(),
    statsOrPackage: text(150).optional(),
    applyLink: webUrl.optional(),
    clubName: text(150).optional(),
    communityCategory: text(100).optional(),
    nextMeeting: text(150).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.category === 'Events' && !value.eventDate)
      ctx.addIssue({ code: 'custom', path: ['eventDate'], message: 'An event date is required.' });
  });
export const commentSchema = z.object({ text: text(2000) });
export const buildingHistorySchema = z.object({ change: text(2000) });
export const courseReviewSchema = z.object({ content: text(2000) });
export const listSchema = z.object({
  category: z.enum(categories).optional(),
  search: z.string().trim().max(150).optional(),
  sort: z.enum(['recent', 'trending', 'top_verified', 'oldest']).default('recent'),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  department: z.string().trim().max(100).optional(),
  year: z.string().trim().max(50).optional(),
  saved: z.enum(['true', 'false']).optional(),
  status: z.enum(['Published', 'Trending']).optional(),
});
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success)
      return res.status(400).json({
        success: false,
        message: 'Please check the highlighted fields.',
        errors: result.error.flatten().fieldErrors,
      });
    req[source] = result.data;
    next();
  };
}
export function numericId(param = 'id') {
  return (req, res, next) => {
    if (!/^[1-9]\d{0,9}$/.test(req.params[param]) || Number(req.params[param]) > 2147483647)
      return res.status(400).json({ success: false, message: 'Invalid resource ID.' });
    next();
  };
}
