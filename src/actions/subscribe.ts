import { createRoute, z } from '@hono/zod-openapi';
import { Context } from 'hono';
import subscriptionRepository from '../repositories/subscription.repository';

const SubscribeRequestSchema = z
    .object({
        email: z
            .string()
            .email()
            .openapi({
                description: 'Subscriber email',
                example: 'john@doe.com',
            }),
        product_sku: z
            .string()
            .min(1)
            .openapi({ description: 'Product SKU', example: 'SI-1000' }),
    })
    .openapi('SubscribeRequest');

enum Statuses {
    OK = 'OK',
    ALREADY_SUBSCRIBED = 'ALREADY_SUBSCRIBED',
}

const SubscribeResponseSchema = z.object({
    status: z.nativeEnum(Statuses).openapi({ example: Statuses.OK }),
});

type SubscribeRequestType = z.infer<typeof SubscribeRequestSchema>;

export const subscribeRouteDefinition = createRoute({
    method: 'post',
    path: '/api/subscribe',
    description: 'Subscribe to product back-in-stock notifications',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: SubscribeRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Subscription successful',
            content: {
                'application/json': {
                    schema: SubscribeResponseSchema,
                },
            },
        },
    },
});

export const subscribeRouteHandler = async (c: Context) => {
    const request = await c.req.json<SubscribeRequestType>();

    const subscription = await subscriptionRepository.findByEmailAndProductSku(
        request.email,
        request.product_sku,
    );

    if (subscription) {
        return c.json({ status: Statuses.ALREADY_SUBSCRIBED });
    }

    await subscriptionRepository.create(request.email, request.product_sku);

    return c.json({ status: Statuses.OK });
};
