import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'

const app = new Hono()

app.use('*', poweredBy())

// Custom Not Found Message
app.notFound((c) => {
  return c.text('Custom 404 Not Found', 404)
})

// Error handling
app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Custom Error Message', 500)
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
