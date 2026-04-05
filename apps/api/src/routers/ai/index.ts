import { router } from '../../trpc';
import { generateProcedure } from './generate';
import { usageRouter } from './usage';

export const aiRouter = router({
  generate: generateProcedure,
  usage: usageRouter,
});
