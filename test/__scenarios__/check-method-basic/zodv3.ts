import { z } from 'zod';

// For demonstration of check transformation - these would be actual check calls in real code
const schema = z.string().min(3);

// Export for testing
export { schema };
export const validData = 'hello';
export const invalidData = 'ab';