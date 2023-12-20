import { createRoute, z } from "@hono/zod-openapi";
import { Context } from "hono";
import subscriptionRepository from "../repositories/subscription.repository";

export const unsubscribeRouteDefinition = createRoute({
  method: "get",
  path: "/api/unsubscribe/{id}",
  description: "Unsubscribe from back-in-stock notifications",
  request: {
    params: z.object({
      id: z
        .string()
        .min(1)
        .ulid()
        .openapi({ example: "01HJ41280A2HEF36XBSRQ33YPD" }),
    }),
  },
  responses: {
    200: {
      description: "Unsubscription successful",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "OK" }),
          }),
        },
      },
    },
    404: {
      description: "Subscription not found",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "Not Found" }),
          }),
        },
      },
    },
  },
});

export const unsubscribeRouteHandler = async (c: Context) => {
  const affectedRows = await subscriptionRepository.delete(c.req.param("id"));

  if (affectedRows === 0) {
    return c.json({ status: "Not Found" }, 404);
  }

  return c.json({ status: "OK" });
};
