// forked from
// https://github.com/ivanakimov/hashids.js/blob/master/lib/hashids.js
// modified for BigInt support and discipline

const myParseInt = (v: any) => (/^(-|\+)?([0-9]+|Infinity)$/.test(v)) ? BigInt(v) : NaN

const errorAlphabetLength = 'error: alphabet must contain at least X unique characters'
const errorAlphabetSpace = 'error: alphabet cannot contain spaces'

const minAlphabetLength = 16
const sepDiv = 3.5
const guardDiv = 12
const escapeRegExp = (s: string) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

export default class Hashids {

    // funcs
    seps = 'cfhistuCFHISTU'
    guards: string

    constructor(
        public salt = '',
        public minLength = 0,
        public alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    ) {

        let uniqueAlphabet = ''
        let sepsLength
        let diff

        if (typeof alphabet === 'string') {
            this.alphabet = alphabet
        }

        for (let i = 0; i !== this.alphabet.length; i++) {
            if (uniqueAlphabet.indexOf(this.alphabet.charAt(i)) === -1) {
                uniqueAlphabet += this.alphabet.charAt(i)
            }
        }

        this.alphabet = uniqueAlphabet

        if (this.alphabet.length < minAlphabetLength) {
            throw new RangeError(errorAlphabetLength.replace('X', '' + minAlphabetLength))
        }

        if (this.alphabet.search(' ') !== -1) {
            throw new RangeError(errorAlphabetSpace)
        }

        /*
            `this.seps` should contain only characters present in `this.alphabet`
            `this.alphabet` should not contains `this.seps`
            */

        for (let i = 0; i !== this.seps.length; i++) {

            const j = this.alphabet.indexOf(this.seps.charAt(i))
            if (j === -1) {
                this.seps = this.seps.substr(0, i) + ' ' + this.seps.substr(i + 1)
            } else {
                this.alphabet = this.alphabet.substr(0, j) + ' ' + this.alphabet.substr(j + 1)
            }
        }

        this.alphabet = this.alphabet.replace(/ /g, '')

        this.seps = this.seps.replace(/ /g, '')
        this.seps = this._shuffle(this.seps, this.salt)

        if (!this.seps.length || (this.alphabet.length / this.seps.length) > sepDiv) {

            sepsLength = Math.ceil(this.alphabet.length / sepDiv)

            if (sepsLength > this.seps.length) {

                diff = sepsLength - this.seps.length
                this.seps += this.alphabet.substr(0, diff)
                this.alphabet = this.alphabet.substr(diff)

            }

        }

        this.alphabet = this._shuffle(this.alphabet, this.salt)
        const guardCount = Math.ceil(this.alphabet.length / guardDiv)

        if (this.alphabet.length < 3) {
            this.guards = this.seps.substr(0, guardCount)
            this.seps = this.seps.substr(guardCount)
        } else {
            this.guards = this.alphabet.substr(0, guardCount)
            this.alphabet = this.alphabet.substr(guardCount)
        }

    }

    encode(...numbers: number[] | bigint[] | string[]) {

        const ret = ''

        if (!numbers.length) {
            return ret
        }

        for (let i = 0; i !== numbers.length; i++) {
            const n = myParseInt(numbers[i])
            if (n >= 0) {
                numbers[i] = n as bigint
            } else {
                return ret
            }
        }

        return this._encode(numbers as bigint[])

    }

    decode(id: string) {

        const ret: bigint[] = []

        if (!id || !id.length || typeof id !== 'string') {
            return ret
        }

        return this._decode(id, this.alphabet)

    }

    _encode(numbers: bigint[]) {

        let alphabet = this.alphabet
        let numbersIdInt = 0n

        for (let i = 0; i !== numbers.length; i++) {
            numbersIdInt += (numbers[i] % (BigInt(i) + 100n))
        }

        let index = Number(numbersIdInt % BigInt(alphabet.length))
        let ret = alphabet.charAt(index)
        const lottery = ret

        for (let i = 0; i !== numbers.length; i++) {
            let num = numbers[i]
            const buffer = lottery + this.salt + alphabet

            alphabet = this._shuffle(alphabet, buffer.substr(0, alphabet.length))
            const last = this._toAlphabet(num, alphabet)

            ret += last

            if (i + 1 < numbers.length) {
                num %= BigInt(last.charCodeAt(0) + i)
                const sepsIndex = Number(num % BigInt(this.seps.length))
                ret += this.seps.charAt(sepsIndex)
            }

        }

        if (ret.length < this.minLength) {

            let guardIndex = (numbersIdInt + BigInt(ret[0].charCodeAt(0))) % BigInt(this.guards.length)
            let guard = this.guards[Number(guardIndex)]

            ret = guard + ret

            if (ret.length < this.minLength) {

                guardIndex = (numbersIdInt + BigInt(ret[2].charCodeAt(0))) % BigInt(this.guards.length)
                guard = this.guards[Number(guardIndex)]

                ret += guard

            }

        }

        const halfLength = alphabet.length >> 1
        while (ret.length < this.minLength) {

            alphabet = this._shuffle(alphabet, alphabet)
            ret = alphabet.substr(halfLength) + ret + alphabet.substr(0, halfLength)

            const excess = ret.length - this.minLength
            if (excess > 0) {
                ret = ret.substr(excess / 2, this.minLength)
            }

        }

        return ret

    }

    _decode(id: string, alphabet: string) {

        let ret: bigint[] = []
        let i = 0
        let r = new RegExp(`[${escapeRegExp(this.guards)}]`, 'g')
        let idBreakdown = id.replace(r, ' ')
        let idArray = idBreakdown.split(' ')

        if (idArray.length === 3 || idArray.length === 2) {
            i = 1
        }

        idBreakdown = idArray[i]
        if (typeof idBreakdown[0] !== 'undefined') {

            const lottery = idBreakdown[0]
            idBreakdown = idBreakdown.substr(1)

            r = new RegExp(`[${escapeRegExp(this.seps)}]`, 'g')
            idBreakdown = idBreakdown.replace(r, ' ')
            idArray = idBreakdown.split(' ')

            for (let j = 0; j !== idArray.length; j++) {

                const subId = idArray[j]
                const buffer = lottery + this.salt + alphabet

                alphabet = this._shuffle(alphabet, buffer.substr(0, alphabet.length))
                ret.push(this._fromAlphabet(subId, alphabet))

            }

            if (this.encode(...ret) !== id) {
                ret = []
            }

        }

        return ret

    }

    _shuffle(alphabet: string, salt: string) {

        let integer

        if (!salt.length) {
            return alphabet
        }

        const alphabets = alphabet.split('')

        for (let i = alphabets.length - 1, v = 0, p = 0, j = 0; i > 0; i--, v++) {

            v %= salt.length
            p += integer = salt.charCodeAt(v)
            j = (integer + v + p) % i

            const tmp = alphabets[j]
            alphabets[j] = alphabets[i]
            alphabets[i] = tmp

        }

        return alphabets.join('')
    }

    _toAlphabet(input: bigint, alphabet: string) {

        let id = ''
        const len = BigInt(alphabet.length)
        do {
            let index = Number(input % len)
            id = alphabet.charAt(index) + id
            input = input / len
        } while (input)

        return id

    }

    _fromAlphabet(input: string, alphabet: string) {
        const len = BigInt(alphabet.length)
        return input.split('').map(
            (item) => BigInt(alphabet.indexOf(item)),
        ).reduce(
            (carry, item) => carry * len + item,
            0n,
        )

    }

}
