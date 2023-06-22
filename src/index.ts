import path from 'path';
import { Plugin } from 'esbuild'
import { loadEntry } from './entry'
import { resolvePath } from './util'
import { resolveScript } from './script'
import { resolveTemplate } from './template'
import { resolveStyleAsync } from './style'
import { resolveCompiler } from './compiler'
import { Options } from './types'

export default function (opts: Options = {}): Plugin {
	return {
		name: 'vue',

		setup (build) {
			const { sourcemap } = build.initialOptions
			const options: Options = {
				extractCss: true,
				sourceMap: Boolean(sourcemap),
				compiler: resolveCompiler(path.resolve()), // @TODO use compiler
				...opts,
			}

			// Entry
			build.onLoad({ filter: /\.vue$/ }, args => {
				const filename = args.path
				const { contents, errors } = loadEntry(filename, options);
				return {
					contents,
					errors,
				}
			})

			// Script
			build.onResolve({ filter: /\.vue\?type=script/ }, args => {
				return {
					path: args.path,
					namespace: 'vue-script'
				}
			})

			build.onLoad({ filter: /.*/, namespace: 'vue-script' }, args => {
				const [filename, resolveDir] = resolvePath(args.path)
				const { contents, warnings, loader } = resolveScript(filename, options)

				return {
					contents,
					warnings,
					resolveDir,
					loader
				}
			})

			// Template
			build.onResolve({ filter: /\.vue\?type=template/ }, args => {
				return {
					path: args.path,
					namespace: 'vue-template'
				}
			})

			build.onLoad({ filter: /.*/, namespace: 'vue-template' }, args => {
				const [filename, resolveDir] = resolvePath(args.path)
				const { contents, errors } = resolveTemplate(filename, options)
				return {
					contents,
					errors,
					resolveDir
				}
			})

			// Style
			build.onResolve({ filter: /\.vue\?type=style/ }, args => {
				return {
					path: args.path,
					namespace: 'vue-style'
				}
			})

			build.onLoad({ filter: /.*/, namespace: 'vue-style' }, async args => {
				const [filename, resolveDir, query] = resolvePath(args.path)
				const { contents, errors, loader } = await resolveStyleAsync(filename, options, query)

				return {
					contents,
					errors,
					resolveDir,
					loader,
				}
			})
		}
	}
}
