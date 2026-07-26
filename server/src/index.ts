import { connectMongo } from "./lib/mongo.js";
import { createApp } from "./app.js";
import { env } from "./env.js";

async function bootstrap() {
  await connectMongo();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`AAIR To-Do API listening on http://localhost:${env.port}`);
  });
}

void bootstrap();
