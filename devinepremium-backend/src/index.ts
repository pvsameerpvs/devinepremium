import { createApp } from "./app";
import { AppDataSource } from "./config/data-source";
import { env } from "./config/env";
import { authService } from "./services/authService";

async function bootstrap() {
  await AppDataSource.initialize();
  await authService.ensureSeedAdminUser(
    env.SEED_ADMIN_EMAIL,
    env.SEED_ADMIN_PASSWORD,
  );

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(
      `Devine Premium backend running on http://localhost:${env.PORT}`,
    );
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
