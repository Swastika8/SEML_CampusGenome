import { randomBytes } from 'node:crypto';
import './db.js';

const configuredSecret = process.env.JWT_SECRET;
if (
  process.env.NODE_ENV === 'production' &&
  (!configuredSecret ||
    configuredSecret.length < 32 ||
    /replace|example|change|your_|dev_jwt/i.test(configuredSecret))
) {
  throw new Error('Production requires a unique JWT_SECRET of at least 32 characters.');
}
export const jwtSecret = configuredSecret || randomBytes(48).toString('hex');
export const jwtOptions = {
  algorithms: ['HS256'],
  issuer: 'campus-genome',
  audience: 'campus-genome-web',
};
