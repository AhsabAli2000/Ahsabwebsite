import {
  Application,
  isHttpError,
  send,
} from "https://deno.land/x/oak@v12.2.0/mod.ts";
import { exists } from "https://deno.land/std@0.183.0/fs/mod.ts";
import dot from "https://esm.sh/dot@1.1.3";
import pagedata from "./pagedata.json" with { type: "json" };

const PORT = 8000;

const app = new Application();
const templ = dot.template(await Deno.readTextFile("www/layout.html"));
let title, desc;

async function detpath(path) {
    if (await exists(`www${path}`) && path != "/") path = `www${path}`;
    else if (await exists(`www${path}.html`)) path = `www${path}.html`;
    else if (path == "/") path = `www/index.html`;
    else path = `www${path}`;

    return path;
}

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    if (isHttpError(e)) {
      ctx.response.status = e.status;
    } else {
      ctx.response.status = 500;
    }
    ctx.response.body = templ({
      body:
        `<h1>${ctx.response.status}</h1><p><a href="./index">Back to main site</a></p>`,
      title: ctx.response.status,
      desc: ctx.response.status,
    });
  }
});

app.use(async (ctx) => {
  const regex = new RegExp("\.htm|\.html");
  let filename = ctx.request.url.pathname;
  let nolayout = ["www/google87c048ae2fb1f3da.html"];

  let sendpath = await detpath(filename);

  if (regex.test(sendpath) && !nolayout.includes(sendpath)) {
    title, desc = filename;
    for (let i = 0; i < pagedata.length; i++) {
      if (pagedata[i].name == filename) {
        title = pagedata[i].title;
        desc = pagedata[i].desc;
      }
    }

    ctx.response.body = await templ({
      body: await Deno.readTextFile(sendpath),
      title: title,
      desc: desc,
    });
  } else {
    await send(ctx, sendpath, {
      root: "./",
    });
  }
});

app.listen({
  port: PORT,
});
