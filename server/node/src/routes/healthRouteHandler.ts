import type { Request, Response } from "express";

import { config } from "../config";

export function healthRouteHandler(_request: Request, response: Response) {
  response.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    hostname: config.HOSTNAME,
  });
}

export function readinessRouteHandler(_request: Request, response: Response) {
  const paypalReady =
    Boolean(config.PAYPAL_SANDBOX_CLIENT_ID) &&
    Boolean(config.PAYPAL_SANDBOX_CLIENT_SECRET);

  response.status(paypalReady ? 200 : 503).json({
    status: paypalReady ? "ready" : "not-ready",
    checks: {
      paypalCredentials: paypalReady,
      staticDirectoriesConfigured: Boolean(
        config.CLIENT_STATIC_DIRECTORY || config.WELL_KNOWN_STATIC_DIRECTORY,
      ),
    },
    timestamp: new Date().toISOString(),
  });
}
