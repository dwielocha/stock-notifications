import 'dotenv/config';
import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { basicAuth } from 'hono/basic-auth';
import notifications from './notifications/actions';
import { version, description } from '../package.json';

const app = new OpenAPIHono();

/** Service routes */
app.route('/api/notifications', notifications);

/** Main routes */
app.get('/', (c) => c.text('Hello!'));
app.get('/api', (c) => c.json({ version, description }));
app.use(
    '/doc/*',
    basicAuth({
        username: process.env.DOC_AUTH_USER!,
        password: process.env.DOC_AUTH_PASSWORD!,
    }),
);

app.get('/doc/ui', swaggerUI({ url: '/doc/openapi' }));
app.doc('/doc/openapi', {
    openapi: '3.0.0',
    info: {
        version,
        title: description,
    },
});

serve({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
});
