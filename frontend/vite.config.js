import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Écoute sur toutes les interfaces (nécessaire pour Docker)
    port: 5173,
    strictPort: true, // Échoue si le port est déjà utilisé
    watch: {
      usePolling: true, // Nécessaire pour que le Hot Reload fonctionne avec bind mount Docker
      interval: 100 // Fréquence de vérification des changements (ms)
    },
    hmr: {
      host: 'localhost', // Host pour le Hot Module Replacement côté client
      port: 5173
    }
  }
})
