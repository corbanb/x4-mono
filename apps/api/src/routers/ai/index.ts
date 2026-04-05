import { router } from '../../trpc';
import { generateProcedure } from './generate';

export const aiRouter = router({
  generate: generateProcedure,
});
