// app/routes.ts
//
// Zentrale Routen-Definition (React Router Framework Mode).
// "login" ist frei zugänglich, alle "assets"-Routen liegen im geschützten
// Layout "_protected.tsx" und setzen eine erfolgreiche Anmeldung voraus.

import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("login", "routes/login.tsx"),
  layout("routes/_protected.tsx", [
    route("assets", "routes/assets._index.tsx"),
    route("assets/new", "routes/assets.new.tsx"),
    route("assets/:id", "routes/assets.$id.tsx"),
  ]),
] satisfies RouteConfig;
