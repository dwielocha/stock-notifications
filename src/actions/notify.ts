import { createRoute, z } from '@hono/zod-openapi';
import { Context } from 'hono';
import { mailer } from '../utils/mailer';
import subscriptionRepository from '../repositories/subscription.repository';

const NotifyRequestSchema = z
    .object({
        sku: z
            .string()
            .min(1)
            .openapi({ description: 'Product SKU', example: 'SI-1000' }),
        name: z.string().min(1).openapi({
            description: 'Product name',
            example: 'Coca Cola Zero (24x0,33l Lattina)',
        }),
        url: z.string().min(1).openapi({
            description: 'Url to product page',
            example: 'https://www.example.com/product/SI-1000',
        }),
    })
    .openapi('NotifyRequest');

type NotifyRequestType = z.infer<typeof NotifyRequestSchema>;

export const notifyRouteDefinition = createRoute({
    method: 'post',
    path: '/api/notify',
    description:
        'Notify subscribers that product {product_sku} is back in stock.',
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

export const notifyRouteHandler = async (c: Context) => {
    const product = await c.req.json<NotifyRequestType>();

    const subscriptions = await subscriptionRepository.findByProductSku(
        product.sku,
    );

    console.log(
        `Requested notification for ${product.sku}. Found ${subscriptions.length} subscriptions.`,
    );

    const message = {
        from: process.env.SMTP_FROM,
        to: '',
        subject: `${product.name} è di nuovo disponibile!`,
        template: 'email',
        // will be populated in the loop below
        context: {
            productName: '',
            email: '',
            unsubscribeUrl: '',
        },
    };

    let sentCount = 0;

    for (const subscription of subscriptions) {
        const unsubscribeUrl = `${process.env.BASE_URL}/api/unsubscribe/${subscription.id}`;
        const mail = {
            ...message,
            to: subscription.email,
            context: {
                productName: product.name,
                productUrl: product.url,
                email: subscription.email,
                unsubscribeUrl,
            },
        };

        try {
            await mailer.sendMail(mail);
            sentCount++;
        } catch (error) {
            console.error(
                `Nodemailer error sending email to ${subscription.email}`,
                error,
            );
        }
    }

    console.log(`Sending done, ${sentCount} of ${subscriptions.length} sent.`);

    return c.json({ status: 'OK', sent: sentCount });
};
