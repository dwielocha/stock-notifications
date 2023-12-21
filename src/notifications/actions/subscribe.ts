import { createRoute, z } from '@hono/zod-openapi';
import { Context } from 'hono';
import notificationRepostiory, {
    EventType,
} from '../repositories/notification.repository';

enum Statuses {
    OK = 'OK',
    ALREADY_SUBSCRIBED = 'ALREADY_SUBSCRIBED',
}

const SubscribeRequestSchema = z
    .object({
        email: z.string().email().openapi({
            description: 'Subscriber email',
            example: 'john@doe.com',
        }),
        event_type: z.nativeEnum(EventType).openapi({
            description: 'Notification type',
            example: EventType.BACK_IN_STOCK,
        }),
        related_id: z
            .string()
            .min(1)
            .openapi({
                description: `ID of the object that the notification relates. E.g. for '${EventType.BACK_IN_STOCK}' is Product SKU`,
                example: 'SI-1000',
            }),
    })
    .openapi('SubscribeRequest');

const SubscribeResponseSchema = z.object({
    status: z.nativeEnum(Statuses).openapi({ example: Statuses.OK }),
});

type SubscribeRequestType = z.infer<typeof SubscribeRequestSchema>;

export const subscribeRouteDefinition = createRoute({
    method: 'post',
    path: '/subscribe',
    description: 'Subscribe to notifications related to given object',
    tags: ['notifications'],
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

    const notification = await notificationRepostiory.findExisting(
        request.email,
        request.event_type,
        request.related_id,
    );

    if (notification) {
        return c.json({ status: Statuses.ALREADY_SUBSCRIBED });
    }

    await notificationRepostiory.create(
        request.email,
        request.event_type,
        request.related_id,
    );

    return c.json({ status: Statuses.OK });
};
