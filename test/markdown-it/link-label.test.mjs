import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import markdownit from '../../src/index.ts'

const md = markdownit('commonmark')

function referenceEnv (label) {
  return {
    references: {
      [label.toUpperCase()]: { href: '/url', title: '' }
    }
  }
}

describe('Link label length', () => {
  it('limits block reference definitions to 999 characters', () => {
    const valid = 'x'.repeat(999)
    const invalid = 'x'.repeat(1000)

    assert.strictEqual(md.render(`[${valid}]: /url\n`), '')
    assert.strictEqual(md.render(`[${invalid}]: /url\n`), `<p>[${invalid}]: /url</p>\n`)
  })

  it('counts escaped characters in block reference labels', () => {
    const valid = 'x'.repeat(997) + '\\]'
    const invalid = 'x'.repeat(998) + '\\]'

    assert.strictEqual(md.render(`[${valid}]: /url\n`), '')
    assert.strictEqual(md.render(`[${invalid}]: /url\n`), `<p>[${invalid.replace('\\]', ']')}]: /url</p>\n`)
  })

  it('counts newlines in multiline block reference labels', () => {
    const valid = 'x'.repeat(998) + '\n'
    const invalid = 'x'.repeat(999) + '\n'

    assert.strictEqual(md.render(`[${valid}]: /url\n`), '')
    assert.strictEqual(md.render(`[${invalid}]: /url\n`), `<p>[${invalid}]: /url</p>\n`)
  })

  it('limits full reference labels for links and images', () => {
    const valid = 'x'.repeat(999)
    const invalid = 'x'.repeat(1000)

    assert.strictEqual(
      md.renderInline(`[text][${valid}]`, referenceEnv(valid)),
      '<a href="/url">text</a>'
    )
    assert.strictEqual(
      md.renderInline(`[text][${invalid}]`, referenceEnv(invalid)),
      `[text][${invalid}]`
    )
    assert.strictEqual(
      md.renderInline(`[text][${invalid}]`, referenceEnv('text')),
      `<a href="/url">text</a>[${invalid}]`
    )
    assert.strictEqual(
      md.renderInline(`![alt][${invalid}]`, referenceEnv('alt')),
      '<img src="/url" alt="alt" />' + `[${invalid}]`
    )

    assert.strictEqual(
      md.renderInline(`![alt][${valid}]`, referenceEnv(valid)),
      '<img src="/url" alt="alt" />'
    )
    assert.strictEqual(
      md.renderInline(`![alt][${invalid}]`, referenceEnv(invalid)),
      `![alt][${invalid}]`
    )
  })

  it('limits collapsed and shortcut reference labels', () => {
    const valid = 'x'.repeat(999)
    const invalid = 'x'.repeat(1000)

    assert.strictEqual(
      md.renderInline(`[${valid}][]`, referenceEnv(valid)),
      `<a href="/url">${valid}</a>`
    )
    assert.strictEqual(
      md.renderInline(`[${invalid}][]`, referenceEnv(invalid)),
      `[${invalid}][]`
    )
    assert.strictEqual(
      md.renderInline(`[${valid}]`, referenceEnv(valid)),
      `<a href="/url">${valid}</a>`
    )
    assert.strictEqual(
      md.renderInline(`[${invalid}]`, referenceEnv(invalid)),
      `[${invalid}]`
    )
  })

  it('does not limit ordinary inline link text', () => {
    const text = 'x'.repeat(1000)

    assert.strictEqual(
      md.renderInline(`[${text}](url)`),
      `<a href="url">${text}</a>`
    )
    assert.strictEqual(
      md.renderInline(`[${text}][ref]`, referenceEnv('ref')),
      `<a href="/url">${text}</a>`
    )
  })
})
