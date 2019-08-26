import Hashids from '../src/hashid'
import { assert } from 'chai'

describe('custom salt', () => {

	const testSalt = (salt: string) => {

		const hashids = new Hashids(salt)
		const numbers = [1n, 2n, 3n]

		const id = hashids.encode(...numbers)
		const decodedNumbers = hashids.decode(id)

		assert.deepEqual(decodedNumbers, numbers)

	}

	it(`should work with ''`, () => {
		testSalt('')
	})

	it(`should work with '   '`, () => {
		testSalt('   ')
	})

	it(`should work with 'this is my salt'`, () => {
		testSalt('this is my salt')
	})

	it(`should work with a really long salt`, () => {
		testSalt('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`~!@#$%^&*()-_=+\\|\'";:/?.>,<{[}]')
	})

	it(`should work with a weird salt`, () => {
		testSalt('`~!@#$%^&*()-_=+\\|\'";:/?.>,<{[}]')
	})

})
