import {
  Application,
  Router,
  send,
  isHttpError,
} from "https://deno.land/x/oak@v12.2.0/mod.ts";
import { exists } from "https://deno.land/std@0.183.0/fs/mod.ts";
// import { getTemplate } from "./template.js";
async function getTemplate(file, data) {
	data.body = eval('`' + await Deno.readTextFile(data.body) + '`')
	let text = await Deno.readTextFile(file)
	return eval('`' + text +'`')
}
const PORT = 8000;

const router = new Router();
const app = new Application();

app.use(async (ctx, next) => {
	try {
		await next()
	} catch (e) {
		if (isHttpError(e)) {
			ctx.response.status = e.status
		} else {
			ctx.response.status = 500
		}
		ctx.response.body = await getTemplate("www/layout.html", {"body": "www/error.html", "title" : e.status, "heading": e.status})
	}
})

app.use(async (ctx, next) => {
	let filepath = await ctx.request.url.pathname
	let regex = new RegExp("\.htm|\.html")
	if (await exists(`www${filepath}.html`)) {
		filepath = `www${filepath}.html`
	} else if (filepath == "/"){
		filepath = `www/index.html`
	}
	else {
		filepath = `www${filepath}`
	}
	console.log(filepath)
	if (regex.test(filepath)){
		ctx.response.body = await getTemplate("www/layout.html", {"body": filepath})
		console.log(ctx.response.body)
	} else {
		await send(ctx, filepath, {
			root: "./",
		})
	}
});

app.listen({
  port: PORT,
});
