import { z } from 'zod';

export const categories = ['Academics', 'Career', 'Communities', 'Events', 'Lifestyle'];
const postCategories = ['Discussion', ...categories];
const text = (max) => z.string().trim().min(1).max(max);
export const forumSlug = z
  .string()
  .min(3)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
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
    category: z.enum(postCategories),
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
    communitySlug: forumSlug.optional(),
    postKind: z.enum(['Discussion', 'Question', 'Guide', 'Link']).optional(),
    linkUrl: webUrl.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.category === 'Events' && !value.eventDate)
      ctx.addIssue({ code: 'custom', path: ['eventDate'], message: 'An event date is required.' });
    if (value.postKind === 'Link' && !value.linkUrl)
      ctx.addIssue({ code: 'custom', path: ['linkUrl'], message: 'Add a URL for a link post.' });
  });
export const commentSchema = z.object({
  text: text(2000),
  parentId: z.number().int().min(1).max(2147483647).optional(),
});
export const commentListSchema = z.object({
  after: z.coerce.number().int().min(0).max(2147483647).default(0),
  limit: z.coerce.number().int().min(1).max(200).default(200),
});
export const postVoteSchema = z.object({
  value: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});
export const communitySchema = z.object({
  name: z.string().trim().min(3).max(60),
  slug: forumSlug,
  campus: z.string().trim().min(2).max(100),
  description: z.string().trim().min(12).max(500),
});
export const forumDirectorySchema = z.object({
  search: z.string().trim().max(100).optional(),
  campus: z.string().trim().max(100).optional(),
  joined: z.enum(['true', 'false']).default('false'),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export const postReportSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'personal-information', 'misleading', 'other']),
});
export const reportReviewSchema = z.object({ action: z.enum(['dismiss', 'remove']) });
export const buildingHistorySchema = z.object({ change: text(2000) });
export const courseReviewSchema = z.object({ content: text(2000) });
export const pulseDateSchema = z.object({ pollDate: z.iso.date() });
export const pulseVoteSchema = pulseDateSchema.extend({ optionId: z.number().int().min(0).max(3) });
export const listSchema = z.object({
  category: z.enum(postCategories).optional(),
  search: z.string().trim().max(150).optional(),
  sort: z.enum(['recent', 'trending', 'top_verified', 'oldest', 'hot', 'top']).default('recent'),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  department: z.string().trim().max(100).optional(),
  year: z.string().trim().max(50).optional(),
  saved: z.enum(['true', 'false']).optional(),
  status: z.enum(['Published', 'Trending']).optional(),
  scope: z.enum(['all', 'following']).default('all'),
  community: forumSlug.optional(),
  campus: z.string().trim().max(100).optional(),
  window: z.enum(['week', 'month', 'all']).default('all'),
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
