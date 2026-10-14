import { describe, expect, it } from "vitest";
import request from "supertest";
import express from "express";

import { healthRouteHandler } from "./healthRouteHandler";

describe("healthRouteHandler", () => {
  it("returns 200 ok", async () => {
    const app = express();
    app.get("/health", healthRouteHandler);

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body).toEqual(
      expect.objectContaining({
        status: "ok",
        environment: expect.any(String),
        hostname: expect.any(String),
      }),
    );
  });
});
