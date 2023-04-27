export async function getTemplate(file, data) {
	data.body = eval('`' + await Deno.readTextFile(data.body) + '`')
	let text = await Deno.readTextFile(file)
	return eval('`' + text +'`')
}