import { createRoute, z } from "@hono/zod-openapi";
import { Context } from "hono";

const SubscribeRequestSchema = z
  .object({
    email: z.string().email().openapi({ example: "john@doe.com" }),
    product_sku: z.string().min(1).openapi({ example: "SI-1000" }),
  })
  .openapi("SubscribeRequest");

export const subscribeRouteDefinition = createRoute({
  method: "post",
  path: "/api/subscribe",
  description: "Subscribe to product back-in-stock notifications",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SubscribeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Subscription successful",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "OK" }),
          }),
        },
      },
    },
  },
});

export const subscribeRouteHandler = (c: Context) => {
  return c.json({ status: "OK" });
};
