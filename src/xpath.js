import getDocument from 'get-document'

import DOMException from './dom-exception'

// https://developer.mozilla.org/en-US/docs/XPathResult
const FIRST_ORDERED_NODE_TYPE = 9

// Default namespace for XHTML documents
const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'


/**
 * Compute an XPath expression for the given node.
 *
 * If the optional parameter `root` is supplied, the computed XPath expression
 * will be relative to it. Otherwise, the root element is the root of the
 * document to which `node` belongs.
 *
 * @param {Node} node The node for which to compute an XPath expression.
 * @param {Node} [root] The root context for the XPath expression.
 * @returns {string}
 */
export function fromNode(node, root = null) {
  if (node === undefined) {
    throw new Error('missing required parameter "node"')
  }

  root = root || getDocument(node)

  let path = '/'
  while (node !== root) {
    if (!node) {
      let message = 'The supplied node is not contained by the root node.'
      let name = 'InvalidNodeTypeError'
      throw new DOMException(message, name)
    }
    path = `/${nodeName(node)}[${nodePosition(node)}]${path}`
    node = node.parentNode
  }
  return path.replace(/\/$/, '')
}


/**
 * Find a node using an XPath relative to the given root node.
 *
 * The XPath expressions are evaluated relative to the Node argument `root`.
 *
 * If the optional parameter `resolver` is supplied, it will be used to resolve
 * any namespaces within the XPath.
 *
 * @param {string} path An XPath String to evaluate.
 * @param {Node} root The root context for the XPath expression.
 * @returns {Node|null} The first matching Node or null if none is found.
 */
export function toNode(path, root, resolver = null) {
  if (path === undefined) {
    throw new Error('missing required parameter "path"')
  }
  if (root === undefined) {
    throw new Error('missing required parameter "root"')
  }

  // Make the path relative to the root, if not the document.
  let document = getDocument(root)
  if (root !== document) path = path.replace(/^\//, './')

  // Make a default resolver.
  let documentElement = document.documentElement
  if (resolver === null && documentElement.lookupNamespaceURI) {
    let defaultNS = documentElement.lookupNamespaceURI(null) || HTML_NAMESPACE
    resolver = (prefix) => {
      let ns = {'_default_': defaultNS}
      return ns[prefix] || documentElement.lookupNamespaceURI(prefix)
    }
  }

  return resolve(path, root, resolver)
}


// Get the XPath node name.
function nodeName(node) {
  switch (node.nodeName) {
  case '#text': return 'text()'
  case '#comment': return 'comment()'
  case '#cdata-section': return 'cdata-section()'
  default: return node.nodeName.toLowerCase()
  }
}


// Get the ordinal position of this node among its siblings of the same name.
function nodePosition(node) {
  let name = node.nodeName
  let position = 1
  while ((node = node.previousSibling)) {
    if (node.nodeName === name) position += 1
  }
  return position
}


// Find a single node with XPath `path`
function resolve(path, root, resolver) {
  try {
    // Add a default value to each path part lacking a prefix.
    let nspath = path.replace(/\/(?!\.)([^\/:\(]+)(?=\/|$)/g, '/_default_:$1')
    return platformResolve(nspath, root, resolver)
  } catch (err) {
    return fallbackResolve(path, root)
  }
}


// Find a single node with XPath `path` using the simple, built-in evaluator.
function fallbackResolve(path, root) {
  let steps = path.split("/")
  let node = root
  while (node) {
    let step = steps.shift()
    if (step === undefined) break
    if (step === '.') continue
    let [name, position] = step.split(/[\[\]]/)
    name = name.replace('_default_:', '')
    position = position ? parseInt(position) : 1
    node = findChild(node, name, position)
  }
  return node
}


// Find a single node with XPath `path` using `document.evaluate`.
function platformResolve(path, root, resolver) {
  let document = getDocument(root)
  let r = document.evaluate(path, root, resolver, FIRST_ORDERED_NODE_TYPE, null)
  return r.singleNodeValue
}


// Find the child of the given node by name and ordinal position.
function findChild(node, name, position) {
  for (node = node.firstChild ; node ; node = node.nextSibling) {
    if (nodeName(node) === name && --position === 0) break
  }
  return node
}
