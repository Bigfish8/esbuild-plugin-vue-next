import { OnLoadResult } from 'esbuild'
import { Options } from './types'
import { createDescriptor } from './cache'
import { convertErrors } from './util'

export function loadEntry (filename: string, options: Options): OnLoadResult {
	const { descriptor, errors } = createDescriptor(filename, options);

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
			styleImportCode += `\nimport ${importVarName} from ${JSON.stringify(`${stylePath}&isModule=true&isNameImport=true`)}`
			styleImportCode += `\ncssModules[${JSON.stringify(moduleName)}] = ${importVarName}`
			styleImportCode += `\nimport ${JSON.stringify(`${stylePath}&isModule=true`)}`
		} else {
			// css file import
			styleImportCode += `\nimport ${JSON.stringify(stylePath)}`
		}
	})

	const scoped = descriptor.styles.some(s => s.scoped);
	let scopeIdInject = ''
	if (scoped) {
		scopeIdInject += `script.__scopeId = ${JSON.stringify(`data-v-${descriptor.id}`)}`
	}

	const scriptExportCode = 'export default script'

	const contents = [
		scriptImportCode,
		templateImportCode,
		templateBindCode,
		styleImportCode,
		scopeIdInject,
		scriptExportCode
	]
	.filter(Boolean)
	.join('\n')

	return {
		contents,
		errors: convertErrors(errors, filename)
	}
}
