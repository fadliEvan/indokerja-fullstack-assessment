import { createApp } from './app';
import { ENV } from './config/env';

const app = createApp();

app.listen(ENV.PORT, () => {
  console.log(`[IndoKerja API] Server running at http://localhost:${ENV.PORT}`);
  console.log(`[IndoKerja API] Health check at http://localhost:${ENV.PORT}/api/health`);
});
