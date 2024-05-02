import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from "hono/cors";
import file from "./routers/file";
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const drawChartPath = join(__dirname, '..', 'draw-chart');
if (!existsSync(drawChartPath)) {
  mkdirSync(drawChartPath, { recursive: true });
}

export const app = new Hono().basePath("/api");

app.use("*", cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE', 'PUT', 'PATCH'],
  credentials: false
}));

app.route("/file",file)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
