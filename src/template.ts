import { compileTemplate, SFCDescriptor, SFCTemplateCompileOptions } from 'vue/compiler-sfc'
import { OnLoadResult } from 'esbuild'
import convert from 'convert-source-map'
import { Options } from './types'
import { getDescriptor } from './cache'
import { convertErrors } from './util'

export function resolveTemplate (filename: string, options: Options): OnLoadResult {
	const descriptor = getDescriptor(filename)
	const templateOptions = getTemplateOptions(descriptor, options);
	const { code, errors, map } = compileTemplate(templateOptions)

	let contents = code;
	if (map) contents += convert.fromObject(map).toComment()

	return {
		contents,
		errors: convertErrors(errors, filename)
	}
}

export function getTemplateOptions (descriptor: SFCDescriptor, options: Options): SFCTemplateCompileOptions {
	const scoped = descriptor.styles.some(s => s.scoped)

	return {
		...options.template,
		id: descriptor.id,
		filename: descriptor.filename,
		source: descriptor.template!.content,
		scoped,
		isProd: options.isProduction,
		inMap: descriptor.template!.map,
		compilerOptions: {
			...options.template?.compilerOptions,
			scopeId: scoped ? `data-v-${descriptor.id}` : undefined,
			sourceMap: options.sourceMap,
		},
	}
}
