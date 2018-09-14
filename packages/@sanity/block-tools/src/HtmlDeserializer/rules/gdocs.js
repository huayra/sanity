import {DEFAULT_SPAN, DEFAULT_BLOCK, HTML_BLOCK_TAGS, HTML_HEADER_TAGS} from '../../constants'
import {tagName} from '../helpers'

// font-style:italic seems like the most important rule for italic / emphasis in their html
function isEmphasis(el) {
  const style = el.getAttribute('style')
  return !!style.match(/font-style:italic/)
}

// font-weight:700 seems like the most important rule for bold in their html
function isStrong(el) {
  const style = el.getAttribute('style')
  return !!style.match(/font-weight:700/)
}

// Attribute given by the preprosessorprocessor
function isGoogleDocs(el) {
  return el.getAttribute('data-is-google-docs')
}

function getListItemStyle(el) {
  if (!['ul', 'ol'].includes(tagName(el.parentNode))) {
    return undefined
  }
  return tagName(el.parentNode) === 'ul' ? 'bullet' : 'number'
}

function getListItemLevel(el) {
  let level = 0
  if (tagName(el) === 'li') {
    let parentNode = el.parentNode
    while (parentNode) {
      // eslint-disable-next-line max-depth
      if (['ul', 'ol'].includes(tagName(parentNode))) {
        level++
      }
      parentNode = parentNode.parentNode
    }
  } else {
    level = 1
  }
  return level
}

const blocks = {...HTML_BLOCK_TAGS, ...HTML_HEADER_TAGS}

function getBlockStyle(el, enabledBlockStyles) {
  const block = blocks[tagName(el.firstChild)]
  if (!block) {
    return 'normal'
  }
  if (!enabledBlockStyles.includes(block.style)) {
    return 'normal'
  }
  return block.style
}

export default function createGDocsRules(blockContentType, options = {}) {
  return [
    {
      deserialize(el, next) {
        if (tagName(el) === 'span' && isGoogleDocs(el)) {
          const span = {
            ...DEFAULT_SPAN,
            marks: [],
            text: el.innerText
          }
          if (isStrong(el)) {
            span.marks.push('strong')
          }
          if (isEmphasis(el)) {
            span.marks.push('em')
          }
          return span
        }
        return undefined
      }
    },
    {
      deserialize(el, next) {
        if (tagName(el) === 'li' && isGoogleDocs(el)) {
          return {
            ...DEFAULT_BLOCK,
            listItem: getListItemStyle(el),
            level: getListItemLevel(el),
            style: getBlockStyle(el, options.enabledBlockStyles),
            children: next(el.firstChild.childNodes)
          }
        }
        return undefined
      }
    }
  ]
}
