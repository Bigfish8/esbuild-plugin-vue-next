import { SFCTemplateCompileOptions, SFCScriptCompileOptions, SFCAsyncStyleCompileOptions } from 'vue/compiler-sfc'
import { Compiler } from './compiler';

export interface Options {
	isProduction?: boolean

	extractCss?: boolean

	sourceMap?: boolean

	template?: Pick<
		SFCTemplateCompileOptions,
		'compiler' | 'compilerOptions' | 'preprocessLang' | 'preprocessOptions' | 'preprocessCustomRequire' | 'transformAssetUrls'
	>

	script?: Pick<SFCScriptCompileOptions, 'babelParserPlugins'>

	style?: Pick<
		SFCAsyncStyleCompileOptions,
		'modulesOptions' | 'preprocessLang' | 'preprocessOptions' | 'postcssOptions' | 'postcssPlugins'
	>

	/**
	 * Use custom compiler-sfc instance. Can be used to force a specific version.
	 */
	compiler?: Compiler
}
