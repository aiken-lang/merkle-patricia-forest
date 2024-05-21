/** @module helpers */

import assert from 'node:assert';


/** Turn a an object whose keys are hex-digits into a sparse vector.
 * Fill gaps with 'undefined' values.
 *
 * @example
 * intoVector({ 1: 'foo' }) // [undefined, 'foo', undefined, ...13 more times]
 *
 * @example
 * intoVector({ 2: 'bar' }, 3) // [undefined, undefined, 'bar']
 *
 * @param {object} obj A key:value map of nodes.
 * @param {number} [size=16] The final size of the vector.
 * @return {array}
 * @throws {AssertionError} When any key in the object is not a nibble.
 */
export function intoVector(obj, size = 16) {
  let vector = [];
  for (let i = 1; i <= size; i += 1) {
    vector.push(undefined);
  }

  for (let k in obj) {
    const ix = Number.parseInt(k, 16);

    assert(
      isHexDigit(ix),
      `object key must be an hex-digit between 0 and 15 but it was ${k}`,
    );

    vector[ix] = obj[k];
  }

  return vector;
}


/** Find the prefix common to a list of words. Returns an empty Buffer when
 * there's no common prefix.
 *
 * @param {Array<string>} words A list of words.
 * @return {string} The common prefix, if any. An empty string otherwise.
 * @throws {AssertionError} When given an empty list.
 * @throws {AssertionError} When any word in the list is empty.
 */
export function commonPrefix(words) {
  assert(
    words.length > 0,
    'No words to compute prefix from!',
  );

  let prefix;

  words.forEach(word => {
    assert(
      word.length > 0,
      'Cannot compute common prefix of empty words!',
    );

    if (prefix === undefined) {
      prefix = word;
    } else {
      prefix = prefix.slice(0, word.length);

      for (let i = 0; i < word.length; i += 1) {
        if (prefix[i] === undefined) {
          break;
        } else if (prefix[i] !== word[i]) {
          prefix = prefix.slice(0, i);
          break;
        }
      }
    }
  });

  return prefix;
}


/** Ensures that all *values* in the 'what' object are of the given instance.
 * Uses *keys* to display nice error messages.
 *
 * @example
 * assertInstanceOf(Buffer, { foo })
 *
 * @example
 * assertInstanceOf('string', { foo }, (what, type) => typeof what === type)
 *
 * @param {Any} instance Any class/prototype to check against
 * @param {object} what A key:value dictionnary of objects to test against.
 * @param {function} [fn] An (optional) overriding test function in case where
 *                       'instanceof' isn't a good fit.
 *
 * @return {undefined} Returns nothing, but throws an exception in case of failure.
 * @throws {AssertionError} When values of 'what' aren't of the expected type.
 */
export function assertInstanceOf(instance, what, fn) {
  for (let key in what) {
    const expected = instance?.prototype?.constructor?.name || instance;
    const got = what[key]?.prototype?.constructor?.name || typeof what[key];

    assert(
      fn ? fn(what[key], instance) : what[key] instanceof instance,
      `${key} must be an instance of ${expected} but is ${got}`
    );
  }
}


/** Transform each line of a string with the given function. Treat each line as
 * a separate string.
 *
 * @example
 * eachLine(
 *  `foo
 *   bar
 *   baz`,
 *   str => str + ': ' + str.toUpperCase()
 * )
 * // foo: FOO
 * // bar: BAR
 * // baz: BAZ
 *
 *
 * @param {string} str A multiline string.
 * @param {each} each The modifier function to apply to each line.
 * @return {string} A transformed multiline string.
 */
export function eachLine(str, each) {
/**
 *
 * @callback each
 * @param {string} line A line of the original string.
 * @return {string} The modified line.
 */

  return str.split("\n").map(each).join("\n");
}


/**
 * Insert an ellipsis in the middle of a long string, so that at most
 * 'cutoff' digits of the string are displayed.
 *
 * @param {string} msg The string to display
 * @param {number} cutoff Number of digits after which insert an ellipsis
 */
export function withEllipsis(msg, cutoff, options) {
  const ellipsis = options.stylize(`..[${msg.length - cutoff} digits]..`, 'undefined');

  return msg.length > cutoff
    ? `${msg.slice(0, cutoff / 2)}${ellipsis}${msg.slice(-cutoff / 2)}`
    : `${msg}`;
}


/**
 * Convert an string of hexadecimal digits into an array of digits a.k.a nibbles
 *
 * @example
 * nibbles('ab') // Buffer<0a, 0b>
 *
 * @example
 * nibbles('0102') // Buffer<00, 01, 00, 02>
 *
 * @param {string} str An hex-encoded string.
 * @return {Buffer} A byte buffer where each byte is a nibble.
 * @throws {AssertionError} When the string contains non hex-digits.
 */
export function nibbles(str) {
  const digits = Array.from(str).map(n => Number.parseInt(n, 16));

  assert(
    typeof str === 'string' && digits.every(isHexDigit),
    `must be a string of hex-digits, but it is: ${str}`,
  );

  return Buffer.from(digits);
}


/**
 * Test whether anything is an hex-digit integer.
 *
 * @param {any} digit
 * @return {bool}
 */
export function isHexDigit(digit) {
  return Number.isInteger(digit) && digit >= 0 && digit <= 15;
}