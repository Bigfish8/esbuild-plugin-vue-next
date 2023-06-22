import path from 'path'
import { Message } from 'esbuild'
import { CompilerError } from 'vue/compiler-sfc'

export function resolvePath (filePath: string) {
	const [filename, query] = filePath.split('?', 2)
	const dirname = path.dirname(filename)
	return [filename, dirname, query]
}

type resolveError = (string | CompilerError | SyntaxError)

export function convertErrors (errors: resolveError[], file: string) {
	const convert = (e: resolveError): Message => {
		let text = '';
		let location: Message['location'] = null

		if (typeof e === 'string') {
			text = e;
		} else if ('loc' in e && e.loc) {
			const start = e.loc!.start
			const lineText = e.loc!.source

			text = e.message;
			location = {
				file,
				namespace: '',
				line: start.line + 1,
				column: start.column,
				length: lineText.length,
				lineText: e.loc!.source,
				suggestion: ''
			}
		} else {
			text = e.message
		}

		return {
			pluginName: 'vue',
			text,
			location,
			notes: [],
			detail: ''
		}
	}

	return errors.map(convert)
}
