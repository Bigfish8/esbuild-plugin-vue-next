import { compileScript } from 'vue/compiler-sfc'
import { OnLoadResult } from 'esbuild'
import convert from 'convert-source-map'
import { Options } from './types'
import { getDescriptor } from './cache'
import { getTemplateOptions } from './template'
import { convertErrors } from './util'

export function resolveScript (filename: string, options: Options): OnLoadResult {
	const descriptor = getDescriptor(filename)
	let contents = 'export default {}'

	if (!descriptor.script && !descriptor.scriptSetup) {
		return {
			contents
		}
	}

	const isTs = (descriptor.script && descriptor.script.lang === 'ts') || (descriptor.scriptSetup && descriptor.scriptSetup.lang === 'ts')

	const { content, map, warnings } = compileScript(descriptor, {
		...options.script,
		id: descriptor.id,
		isProd: options.isProduction,
		inlineTemplate: true,
		templateOptions: descriptor.template ? getTemplateOptions(descriptor, options) : {},
		sourceMap: options.sourceMap,
	})

	contents = content
	if (map) contents += convert.fromObject(map).toComment()

	return {
		contents,
		warnings: convertErrors(warnings || [], filename),
		loader: isTs ? 'ts' : 'js'
	}
}
