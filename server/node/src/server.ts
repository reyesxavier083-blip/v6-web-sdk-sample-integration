import express, { Request, Response } from "express";
import helmet from "helmet";
import path from "node:path";
import cors from "cors";

import { config } from "./config";
import routes from "./routes/index";
import errorMiddleware from "./middleware/errorMiddleware";
import crossOriginOpenerPolicyMiddleware from "./middleware/crossOriginOpenerPolicyMiddleware";
import { rateLimitMiddleware } from "./middleware/rateLimitMiddleware";

const CLIENT_STATIC_DIRECTORY =
  config.CLIENT_STATIC_DIRECTORY || path.join(__dirname, "../../../client");

const WELL_KNOWN_STATIC_DIRECTORY =
  config.WELL_KNOWN_STATIC_DIRECTORY ||
  path.join(__dirname, "../../../.well-known");

const app = express();

app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false,
  }),
);
app.use(rateLimitMiddleware);
app.use(crossOriginOpenerPolicyMiddleware);
app.use(cors());
app.use(express.json());
app.use(routes);
app.use("/client", express.static(CLIENT_STATIC_DIRECTORY));
app.use("/.well-known", express.static(WELL_KNOWN_STATIC_DIRECTORY));

app.get("/", (_request: Request, response: Response) => {
  response.redirect("/client/index.html");
});

app.use(errorMiddleware);

const port = config.PORT;
const hostname = config.HOSTNAME;

app.listen({ port, hostname }, async () => {
  console.log(`Node.js web server listening at: http://${hostname}:${port}`);
  await configureNgrokForHTTPS(port);
});

async function configureNgrokForHTTPS(port: number) {
  if (!config.NGROK_AUTHTOKEN) {
    return;
  }

  try {
    const ngrok = await import("@ngrok/ngrok");

    const listener = await ngrok.connect({
      addr: port,
      authtoken: config.NGROK_AUTHTOKEN,
    });

    console.log(`Ingress secure tunnel established at: ${listener.url()}`);
  } catch (error) {
    console.error("error connecting to ngrok:", error);
  }
}
