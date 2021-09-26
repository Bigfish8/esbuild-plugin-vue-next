import { parse } from '@vue/compiler-sfc'
import { setDesCache } from './cache'
import { convertErrors } from './util'
import { setId } from './cache'

export function loadEntry(source: string, filename: string, sourcemap: boolean) {
    const { descriptor, errors } = parse(source, {
        sourceMap: sourcemap,
        filename
    })

    setDesCache(filename, descriptor)
    const scopeId = setId(filename)

    const scriptPath = JSON.stringify(`${filename}?type=script`)
    const scriptImportCode = `import script from ${scriptPath}` + `\nexport * from ${scriptPath}`

    let templateImportCode = ''
    let templateBindCode = ''
    // scriptSetup inlineTemplate
    if (!descriptor.scriptSetup && descriptor.template) {
        const templatePath = JSON.stringify(`${filename}?type=template`)
        templateImportCode += `import { render } from ${templatePath}`
        templateBindCode += `\nscript.render = render`
    }

    let styleImportCode = ''
    let hasModuleInject = false
    descriptor.styles.forEach((styleBlock, i) => {
        const stylePath = `${filename}?type=style&index=${i}`
        if (styleBlock.module) {
            if (!hasModuleInject) {
                // expose cssModules to script
                styleImportCode += `\nscript.__cssModules = cssModules = {}`
                hasModuleInject = true
            }
            // <style module="someName">
            const moduleName = typeof styleBlock.module === 'string' ? styleBlock.module : '$style'
            const importVarName = `__style${i}`
            styleImportCode += `\nimport ${importVarName} from ${JSON.stringify(
                `${stylePath}&isModule=true&isNameImport=true`
            )}`
            styleImportCode += `\ncssModules[${JSON.stringify(moduleName)}] = ${importVarName}`
            styleImportCode += `\nimport ${JSON.stringify(`${stylePath}&isModule=true`)}`
        } else {
            // css file import
            styleImportCode += `\nimport ${JSON.stringify(stylePath)}`
        }
    })

    let scopeIdInject = ''
    if (descriptor.styles.some(styleBlock => styleBlock.scoped)) {
        scopeIdInject += `script.__scopeId = ${JSON.stringify(scopeId)}`
    }

    const scriptExportCode = 'export default script'

    const code = [
        scriptImportCode,
        templateImportCode,
        templateBindCode,
        styleImportCode,
        scriptExportCode,
        scopeIdInject
    ]
        .filter(Boolean)
        .join('\n')

    return {
        code,
        errors: convertErrors(errors, filename)
    }
}
