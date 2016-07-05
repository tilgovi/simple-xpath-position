import { jsdom } from 'jsdom'
import { assert } from 'assertive-chai'
import * as xpath from '..'

describe('xpath in nodejs environment', () => {
  let doc = jsdom('<body><div></div><body>')

  describe('#fromNode', () => {
    it("generetes an XPath expression from element in the document", () => {
      assert.equal('/html[1]/body[1]/div[1]', xpath.fromNode(doc.body.firstChild, doc))
    })
    it('raises InvalidNodeTypeError if root doesn\'t contain node', () => {
      assert.throws(() => xpath.fromNode(doc.body, doc.body.firstChild))
    })
  })

  describe('#toNode', () => {
    it("parses a standard xpath string", () => {
      assert.strictEqual(doc.body.firstChild, xpath.toNode('/html[1]/body[1]/div[1]', doc))
    })
  })
})

