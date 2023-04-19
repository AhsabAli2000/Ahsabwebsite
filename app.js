import {
  Application,
  Router,
  send,
} from "https://deno.land/x/oak@v12.2.0/mod.ts";

const PORT = 8000;

const router = new Router();
const app = new Application();

app.use(async (ctx) => {
  await send(ctx, ctx.request.url.pathname, {
    contentTypes: {
      ".css": "text/css",
    },
    index: "index.html",
    root: "./www/",
  });
});
app.listen({
  port: PORT,
});
