import { OAuthAuthorizationController } from "@paypal/paypal-server-sdk";
import type { Request, Response } from "express";

import { config } from "../config";
import { client } from "../paypalServerSdkClient";

const { DOMAINS, PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET } = config;

const oAuthAuthorizationController = new OAuthAuthorizationController(client);

export async function clientTokenRouteHandler(
  request: Request,
  response: Response,
) {
  const auth = Buffer.from(
    `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`,
  ).toString("base64");

  const { targetCustomerId, vaultId } = request.query;
  let claimKey = "vault_id";
  if (vaultId && typeof vaultId === "string" && vaultId.startsWith("B-")) {
    claimKey = "billing_agreement_id";
  }

  const fieldParameters = {
    response_type: "client_token",
    ...(DOMAINS && { "domains[]": DOMAINS }),
    ...(targetCustomerId && typeof targetCustomerId === "string"
      ? { target_customer_id: targetCustomerId }
      : {}),
    ...(vaultId && typeof vaultId === "string"
      ? { "claims[]": `${claimKey}:${vaultId}` }
      : {}),
  };

  const { result, statusCode } =
    await oAuthAuthorizationController.requestToken(
      {
        authorization: `Basic ${auth}`,
      },
      fieldParameters,
    );

  interface ClientToken {
    accessToken: string;
    expiresIn: number;
    scope: string;
    tokenType: string;
  }

  const { accessToken, expiresIn, scope, tokenType } = result;
  const transformedResult: ClientToken = {
    accessToken,
    expiresIn: Number(expiresIn),
    scope: String(scope),
    tokenType,
  };

  response.status(statusCode).json(transformedResult);
}

export function clientIdRouteHandler(_request: Request, response: Response) {
  if (!PAYPAL_SANDBOX_CLIENT_ID) {
    throw new Error(
      "PAYPAL_SANDBOX_CLIENT_ID environment variable is not defined",
    );
  }
  response.status(200).json({ clientId: PAYPAL_SANDBOX_CLIENT_ID });
}
