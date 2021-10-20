import { Plugin } from 'esbuild'
import fs from 'fs'
import { parse } from 'querystring'
import { loadEntry } from './entry'
import { resolvePath } from './util'
import { resolveScript } from './script'
import { resolveTemplate } from './template'
import { resolveStyle } from './style'
import { SFCTemplateCompileOptions, SFCScriptCompileOptions, SFCAsyncStyleCompileOptions } from '@vue/compiler-sfc'

export interface Options {
    // template
    templateOptions?: Pick<
        SFCTemplateCompileOptions,
        'compiler' | 'preprocessLang' | 'preprocessOptions' | 'compilerOptions' | 'transformAssetUrls'
    >

    // script
    scriptOptions?: Pick<SFCScriptCompileOptions, 'babelParserPlugins' | 'refSugar'>

    // style
    styleOptions?: Pick<
        SFCAsyncStyleCompileOptions,
        'modulesOptions' | 'preprocessLang' | 'preprocessOptions' | 'postcssOptions' | 'postcssPlugins'
    >
}

function plugin({ templateOptions, scriptOptions, styleOptions }: Options = {}): Plugin {
    return {
        name: 'vue',
        setup(build) {
            const { sourcemap } = build.initialOptions
            const isProd = process.env.NODE_ENV === 'production'

            build.onLoad(
                {
                    filter: /\.vue$/
                },
                async args => {
                    const filename = args.path
                    const source = await fs.promises.readFile(filename, 'utf8')
                    const { code, errors } = loadEntry(source, filename, !!sourcemap)
                    return {
                        contents: code,
                        errors
                    }
                }
            )

            build.onResolve(
                {
                    filter: /\.vue\?type=script/
                },
                args => {
                    return {
                        path: args.path,
                        namespace: 'vue-script'
                    }
                }
            )

            build.onLoad(
                {
                    filter: /.*/,
                    namespace: 'vue-script'
                },
                args => {
                    const [filename, dirname] = resolvePath(args.path)
                    const { code, error, isTs } = resolveScript(
                        filename,
                        scriptOptions,
                        templateOptions,
                        isProd,
                        !!sourcemap
                    )
                    return {
                        contents: code,
                        errors: error,
                        resolveDir: dirname,
                        loader: isTs ? 'ts' : 'js'
                    }
                }
            )

            build.onResolve(
                {
                    filter: /\.vue\?type=template/
                },
                args => {
                    return {
                        path: args.path,
                        namespace: 'vue-template'
                    }
                }
            )

            build.onLoad(
                {
                    filter: /.*/,
                    namespace: 'vue-template'
                },
                args => {
                    const [filename, dirname] = resolvePath(args.path)
                    const { code, errors } = resolveTemplate(filename, templateOptions, isProd)
                    return {
                        contents: code,
                        errors,
                        resolveDir: dirname
                    }
                }
            )

            build.onResolve(
                {
                    filter: /\.vue\?type=style/
                },
                args => {
                    return {
                        path: args.path,
                        namespace: 'vue-style'
                    }
                }
            )

            build.onLoad(
                {
                    filter: /.*/,
                    namespace: 'vue-style'
                },
                async args => {
                    const [filename, dirname, query] = resolvePath(args.path)
                    const { index, isModule, isNameImport } = parse(query)
                    const moduleWithNameImport = !!(isModule && isNameImport)
                    const { styleCode, errors } = await resolveStyle(
                        filename,
                        styleOptions,
                        Number(index),
                        !!isModule,
                        moduleWithNameImport,
                        isProd
                    )
                    return {
                        contents: styleCode,
                        errors,
                        resolveDir: dirname,
                        loader: moduleWithNameImport ? 'json' : 'css'
                    }
                }
            )
        }
    }
}

export default plugin

// for commonjs default require()
module.exports = plugin
