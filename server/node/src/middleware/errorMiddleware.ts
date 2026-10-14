import { z, ZodError } from "zod/v4";
import { ApiError } from "@paypal/paypal-server-sdk";
import type { Request, Response, NextFunction } from "express";

import { CustomApiError } from "../customApiEndpoints/customApiError";

export default async function errorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  const requestId = crypto.randomUUID();

  if (error instanceof ZodError) {
    response.status(400).json({
      error: "Bad Request",
      errorDescription: z.prettifyError(error),
      requestId,
    });
    return;
  }

  if (error instanceof ApiError || error instanceof CustomApiError) {
    const { result, statusCode } = error;
    response.status(statusCode).json({
      ...result,
      requestId,
    });
    return;
  }

  response.status(500).json({
    error: "Internal Server Error",
    errorDescription: error.message || error.toString(),
    requestId,
  });
}
