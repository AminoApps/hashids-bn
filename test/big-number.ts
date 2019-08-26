import Hashids from '../src/hashid'
import { assert } from 'chai'

const hashids = new Hashids()

const map: Record<string, bigint[]> = {
	'JRoJOY8EpBvMr2': [1145141919810931364364n],
	'AnLsBqiy4o8ToXtZjDk': [114n, 514n, 1919810n, 931n, 364364n],
}

describe('encode/decode bigint', () => {

	for (const id in map) {

		const numbers = map[id]

		it(`should encode [${numbers}] to '${id}' (passing numbers)`, () => {
			assert.equal(id, hashids.encode(...numbers))
		})

		it(`should encode [${numbers}] to '${id}' and decode back correctly`, () => {

			const encodedId = hashids.encode(...numbers)
			const decodedNumbers = hashids.decode(encodedId)

			assert.deepEqual(numbers, decodedNumbers)

		})

	}
})
