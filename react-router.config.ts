import type { Config } from "@react-router/dev/config";

// SPA-Modus: Die gesamte App läuft rein im Browser (kein eigener Server-Renderer).
// Das entspricht der Aufgabenstellung "SPA Web-App" und passt zur reinen REST-API
// aus Kapitel 4.2, die unabhängig von diesem Frontend läuft.
export default {
  ssr: false,
} satisfies Config;
