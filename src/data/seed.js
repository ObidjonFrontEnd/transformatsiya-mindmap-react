import raw from './holatlar-seed.json';

// raw: { [dir]: [[id, status], ...] }  ->  { [dir]: { [id]: status } }
export const SEED = Object.fromEntries(
  Object.entries(raw).map(([dir, pairs]) => [dir, Object.fromEntries(pairs)])
);
