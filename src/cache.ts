import fs from 'fs'
import { parse, SFCDescriptor } from 'vue/compiler-sfc'
import { createHash } from 'crypto'
import { Options } from './types';

export const cache = new Map<string, SFCDescriptor>();

export function createDescriptor (filename: string, { sourceMap, isProduction }: Options) {
	const source = fs.readFileSync(filename, 'utf-8');
	const { descriptor, errors } = parse(source, { filename, sourceMap })

	descriptor.id = getHash(filename + (isProduction ? source : ''));

	cache.set(filename, descriptor)

	return {
		descriptor,
		errors
	}
}

export function getDescriptor (filename: string) {
	if (!cache.has(filename)) {
		throw new Error('no descriptor cache')
	}

	return cache.get(filename)!
}

function getHash(filename: string) {
	return createHash('sha256').update(filename).digest('hex').substring(0, 8)
}
