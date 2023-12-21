import { createRoute, z } from '@hono/zod-openapi';
import { Context } from 'hono';
import { mailer } from '@/src/shared/mailer';
import notificationRepostiory, {
    EventType,
} from '../repositories/notification.repository';

const NotifyRequestSchema = z
    .object({
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
        url: z.string().min(1).openapi({
            description: 'URL of the object that the notification relates.',
            example: 'https://www.example.com/product/SI-1000',
        }),
    })
    .openapi('NotifyRequest');

type NotifyRequestType = z.infer<typeof NotifyRequestSchema>;

export const notifyRouteDefinition = createRoute({
    method: 'post',
    path: '/notify',
    description: 'Send notifications for given event type and related object.',
    tags: ['notifications'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: NotifyRequestSchema,
                },
            },
        },
        params: z.object({}),
    },
    responses: {
        200: {
            description: 'Notifications sent',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.string().openapi({ example: 'OK' }),
                        sent: z.number().openapi({
                            description: 'Number of sent notifications',
                            example: 1,
                        }),
                    }),
                },
            },
        },
    },
});

const getMessageForEventType = (request: NotifyRequestType) => {
    if (request.event_type !== EventType.BACK_IN_STOCK) {
        throw new Error(`Unsupported event type: ${request.event_type}`);
    }

    // TODO: get product name from DB
    const productName = 'Example product name';

    return {
        from: process.env.SMTP_FROM,
        to: '',
        subject: `${productName} è di nuovo disponibile!`,
        template: 'product_back_in_stock',
        context: {
            productName,
            url: request.url,
        },
    };
};

export const notifyRouteHandler = async (c: Context) => {
    const request = await c.req.json<NotifyRequestType>();

    const notifications =
        await notificationRepostiory.findNotSentByEventTypeAndRelatedId(
            request.event_type,
            request.related_id,
        );

    console.log(
        `Requested to send notifications for ${request.event_type} for ${request.related_id}. Found ${notifications.length} notifications.`,
    );

    const message = getMessageForEventType(request);
    let sentCount = 0;

    for (const notification of notifications) {
        const mail = {
            ...message,
            to: notification.email,
        };

        try {
            await mailer.sendMail(mail);
            sentCount++;
        } catch (error) {
            console.error(
                `Nodemailer error sending email to ${notification.email}`,
                error,
            );
        }
    }

    console.log(`Sending done, ${sentCount} of ${notifications.length} sent.`);

    return c.json({ status: 'OK', sent: sentCount });
};
