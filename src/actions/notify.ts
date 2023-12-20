import { createRoute, z } from "@hono/zod-openapi";
import { Context } from "hono";
import { mailer } from "../utils/mailer";

export const notifyRouteDefinition = createRoute({
  method: "post",
  path: "/api/notify/{product_sku}",
  description:
    "Notify subscribers that product {product_sku} is back in stock.",
  request: {
    params: z.object({
      product_sku: z.string().min(1).openapi({ example: "SI-1000" }),
    }),
  },
  responses: {
    200: {
      description: "Notifications sent",
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

export const notifyRouteHandler = async (c: Context) => {
  const productName = "Coca Cola Zero (24x0,33l Lattina)";
  const subscribers = [
    {
      id: "01EYQZQZJZJZJZJZJZJZJZJZJZ",
      email: "damian@wielocha.com",
      product_sku: "SI-1000",
      created_at: "2021-01-01T00:00:00.000Z",
    },
  ];

  const message = {
    from: process.env.SMTP_FROM,
    to: "",
    subject: `${productName} è di nuovo disponibile!`,
    template: "email",
    context: {
      productName: "",
      email: "",
      unsubscribeUrl: "",
    },
  };

  subscribers.forEach(async (subscriber) => {
    const unsubscribeUrl = `/api/unsubscribe/${subscriber.id}`;
    const mail = {
      ...message,
      to: subscriber.email,
      context: {
        productName,
        email: subscriber.email,
        unsubscribeUrl,
      },
    };

    try {
      await mailer.sendMail(mail);
    } catch (error) {
      console.error(
        `Nodemailer error sending email to ${subscriber.email}`,
        error
      );
    }
  });

  return c.json({ status: "OK", id: c.req.param("product_sku") });
};
