import { compileStyleAsync, SFCStyleCompileOptions } from 'vue/compiler-sfc'
import { Loader, OnLoadResult } from 'esbuild'
import convert from 'convert-source-map'
import { parse } from 'querystring'
import { getDescriptor } from './cache'
import { Options } from './types'
import { convertErrors } from './util'

export async function resolveStyleAsync (filename: string, options: Options, query: string): Promise<OnLoadResult> {
	const { index, isModule, isNameImport } = parse(query)
	const moduleWithNameImport = !!(isModule && isNameImport)

	const descriptor = getDescriptor(filename)
	const styleBlock = descriptor.styles[Number(index)]

	function getLoader (): Loader {
		if (moduleWithNameImport) return 'json'
		if (!options.extractCss) return 'js'
		return 'css'
	}

	const { code, modules, map, errors } = await compileStyleAsync({
		...options.style,
		id: `data-v-${descriptor.id}`,
		filename: descriptor.filename,
		source: styleBlock.content,
		scoped: styleBlock.scoped,
		trim: true,
		isProd: options.isProduction,
		inMap: styleBlock.map,
		preprocessLang: styleBlock.lang as SFCStyleCompileOptions['preprocessLang'],
		modules: !!isModule
	})

	let contents = moduleWithNameImport ? JSON.stringify(modules) : code;

	if (map && !moduleWithNameImport) {
		contents += convert.fromObject(map).toComment({ multiline: true })
	}

	if (!options.extractCss) {
		contents = `
		{
			const el = document.createElement('style');
			el.textContent = ${JSON.stringify(contents)};
			document.head.append(el);
		}`
	}

	return {
		contents,
		errors: convertErrors(errors, filename),
		loader: getLoader()
	}
}
