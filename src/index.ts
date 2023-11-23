import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";

const app = new Hono();

app.use("*", poweredBy());

app.get("/", (c) => {
  return c.text("Hello Hono!");
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
