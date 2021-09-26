import path from 'path'
import { Message } from 'esbuild'
import { parse } from '@vue/compiler-sfc'

export function resolvePath(filePath: string) {
    const [filename, query] = filePath.split('?', 2)
    const dirname = path.dirname(filename)
    return [filename, dirname, query]
}

type ParseErrors = ReturnType<typeof parse>['errors']
export function convertErrors(errors: ParseErrors, filename: string) {
    const convert = (e: ParseErrors[number]): Message => {
        let location: Message['location'] = null
        if ('loc' in e && Object.prototype.hasOwnProperty.call(e, 'loc')) {
            const start = e.loc!.start
            const lineText = e.loc!.source
            location = {
                file: filename,
                namespace: '',
                line: start.line + 1,
                column: start.column,
                length: lineText.length,
                lineText: e.loc!.source,
                suggestion: ''
            }
        }
        return {
            pluginName: 'vue',
            text: e.message,
            location: location,
            notes: [],
            detail: ''
        }
    }
    return errors.map(e => convert(e))
}
