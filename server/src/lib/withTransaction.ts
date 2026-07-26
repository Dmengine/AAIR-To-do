import mongoose from "mongoose";

export async function withTransaction<T>(operation: (session: mongoose.ClientSession) => Promise<T>): Promise<T> {
  const session = await mongoose.startSession();

  try {
    let resolvedValue!: T;

    await session.withTransaction(async () => {
      resolvedValue = await operation(session);
    });

    return resolvedValue;
  } finally {
    session.endSession();
  }
}
