import dotenv from 'dotenv';
import path from 'path';

const envFiles = ['.env.local', '.env'];

envFiles.forEach((file) => {
  const result = dotenv.config({ path: path.resolve(process.cwd(), file) });
  if (result.error) {
    const err = result.error as NodeJS.ErrnoException;
    if (err.code !== 'ENOENT') {
      console.warn(`⚠️  Failed to load ${file}:`, err.message);
    }
  }
});

const requiredVars = ['JWT_SECRET', 'MONGODB_URI'];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
}
