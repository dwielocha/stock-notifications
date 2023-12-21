import { OpenAPIHono } from '@hono/zod-openapi';
import { subscribeRouteDefinition, subscribeRouteHandler } from './subscribe';
import { notifyRouteDefinition, notifyRouteHandler } from './notify';

const app = new OpenAPIHono();
app.openapi(subscribeRouteDefinition, subscribeRouteHandler);
app.openapi(notifyRouteDefinition, notifyRouteHandler);

export default app;
