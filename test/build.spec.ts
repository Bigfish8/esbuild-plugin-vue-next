import { build } from 'esbuild'
import fs from 'fs'
import pluginVue from '../src'

const assertNoCompileError = async () => {
    const testDir = 'examples'
    const compileDirList = await fs.promises.readdir(testDir)
    const onError = jest.fn()
    await Promise.all(
        compileDirList.map(subDir =>
            build({
                entryPoints: [`${testDir}/${subDir}/App.vue`],
                bundle: true,
                external: ['vue'],
                plugins: [pluginVue()],
                sourcemap: false,
                format: 'esm',
                outfile: `${testDir}/${subDir}/App.js`
            }).catch(() => onError())
        )
    )
    expect(onError).not.toHaveBeenCalled()
}

describe('compile', () => {
    it('can transfrom .vue file', async () => {
        await assertNoCompileError()
    })
})
