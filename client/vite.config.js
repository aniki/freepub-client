import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      manifest: {
        name: "FREEPUB",
        short_name: "Freepub",
        theme_color: "#111",
        start_url: "/",
        display: "standalone",
        background_color: "#111111",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    })
  ]
}