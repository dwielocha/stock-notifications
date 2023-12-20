import "dotenv/config";
import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { basicAuth } from "hono/basic-auth";
import {
  notifyRouteDefinition,
  notifyRouteHandler,
  subscribeRouteDefinition,
  subscribeRouteHandler,
  unsubscribeRouteDefinition,
  unsubscribeRouteHandler,
} from "./actions";

const app = new OpenAPIHono();

app.get("/", (c) => c.text("Hello!"));

app.openapi(subscribeRouteDefinition, subscribeRouteHandler);
app.openapi(unsubscribeRouteDefinition, unsubscribeRouteHandler);
app.openapi(notifyRouteDefinition, notifyRouteHandler);

app.use(
  "/doc/*",
  basicAuth({
    username: "bevy",
    password: "express",
  })
);

app.doc("/doc/openapi", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Stock notification service",
  },
});

app.get("/doc/ui", swaggerUI({ url: "/doc/openapi" }));

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 3000,
});
