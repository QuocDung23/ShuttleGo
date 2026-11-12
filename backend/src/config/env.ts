// Load variables from backend/.env (Node >= 20.12). Real env vars take precedence.
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the real environment
}
