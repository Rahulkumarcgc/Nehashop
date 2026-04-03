import { execSync } from 'child_process';
try {
  const result = execSync('npx prisma db push', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('SUCCESS:', result);
} catch (e) {
  console.log('ERROR STATUS:', e.status);
  console.log('STDOUT:', e.stdout);
  console.log('STDERR:', e.stderr);
}
