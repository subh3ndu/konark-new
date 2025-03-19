import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.glb', '**/*.gltf'], // This ensures Vite handles your 3D model files
  base: '/konark-new',
})
