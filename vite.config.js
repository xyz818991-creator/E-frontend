import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import net from 'net';

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(150);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { socket.destroy(); resolve(false); });
    socket.connect(port, host);
  });
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const localBackendOnline = await isPortOpen(5001);
  const cloudBackend = 'https://ecommerce-eth-backend-production.up.railway.app';

  // Automatically route to local 5001 if backend is running; otherwise fallback seamlessly to live Railway backend
  const backendTarget = localBackendOnline
    ? 'http://127.0.0.1:5001'
    : (env.VITE_BACKEND_URL || cloudBackend);

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              if (res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: false,
                  message: 'Backend server is temporarily unreachable.'
                }));
              }
            });
          }
        }
      }
    }
  };
});
