import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use("*", poweredBy());
app.use("*", cors());
app.use("*", logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/ping", (c) => {
  return c.text("pong");
});

// Custom Not Found Message
app.notFound((c) => {
  return c.text("404 Not Found", 404);
});

// Error handling
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text("Custom Error Message", 500);
});

export default app;
