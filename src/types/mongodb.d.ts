// /src/types/mongodb.d.ts
import type Mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof Mongoose | null;
    promise: Promise<typeof Mongoose> | null;
  } | undefined;
}

export {};

