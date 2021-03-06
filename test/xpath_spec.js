import getDocument from 'get-document'

import * as xpath from '../src/xpath'

describe('xpath', test_toNode);
describe('xpath without document.evaluate or namespace support', () => {
  let document = getDocument(fixture.el)
  let evaluate = document.evaluate
  before(() => document.evaluate = undefined)
  after(() => document.evaluate = evaluate)
  test_toNode()
})

test_fromNode()


function test_fromNode() {
  beforeEach(() => fixture.load('xpath.html'))
  afterEach(() => fixture.cleanup())

  describe('#fromNode', () => {
    it("requires a node argument", () => {
      let call = () => xpath.fromNode()
      assert.throws(call, 'required parameter')
    })

    it("generates an XPath expression for an element in the document", () => {
      let pathToFixHTML = '/html[1]/body[1]/div[1]'

      let pEl = fixture.el.getElementsByTagName('p')[0]
      let pPath = pathToFixHTML + '/p[1]'
      assert.equal(xpath.fromNode(pEl), pPath)

      let spanEl = fixture.el.getElementsByTagName('span')[0]
      let spanPath = pathToFixHTML + '/ol[1]/li[2]/span[1]'
      assert.equal(xpath.fromNode(spanEl), spanPath)

      let strongEl = fixture.el.getElementsByTagName('strong')[0]
      let strongPath = pathToFixHTML + '/p[2]/strong[1]'
      assert.equal(xpath.fromNode(strongEl), strongPath)
    })

    it("takes an optional root parameter for a relative path root", () => {
      let ol = fixture.el.getElementsByTagName('ol')[0]
      let li = fixture.el.getElementsByTagName('li')[0]
      assert.deepEqual(xpath.fromNode(li, ol), '/li[1]')

      let span = fixture.el.getElementsByTagName('span')[0]
      assert.deepEqual(xpath.fromNode(span, ol), '/li[2]/span[1]')
    })

    it('raises InvalidNodeTypeError if root does not contain node ', () => {
      let node = document.createElement('div')
      let check = () => xpath.fromNode(node, fixture.el)
      assert.throws(check, 'InvalidNodeTypeError')
    })
  })
}



function test_toNode() {
  let path = "/p[2]/strong"

  beforeEach(() => fixture.load('xpath.html'))
  afterEach(() => fixture.cleanup())

  it("requires a path argument", () => {
    let call = () => xpath.toNode()
    assert.throws(call, 'required parameter')
  })

  it("requires a root argument", () => {
    let call = () => xpath.toNode(path)
    assert.throws(call, 'required parameter')
  })

  it("should parse a standard xpath string", () => {
    let node = xpath.toNode(path, fixture.el)
    let strong = document.getElementsByTagName('strong')[0]
    assert.strictEqual(node, strong)
  })

  it("should return null when the xpath fails to identify an node", () => {
    let node = xpath.toNode('/p[3]', fixture.el)
    assert.isNull(node)
  })
}
