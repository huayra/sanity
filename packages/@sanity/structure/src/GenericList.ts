import {StructureNode, SerializeOptions, SerializePath, Serializable} from './StructureNodes'
import {ChildResolver} from './ChildResolver'
import {Layout, LayoutOptions} from './Layout'
import {MenuItem, MenuItemBuilder} from './MenuItem'
import {MenuItemGroup, MenuItemGroupBuilder} from './MenuItemGroup'
import {IntentChecker} from './Intent'
import {SerializeError} from './SerializeError'

function maybeSerializeMenuItemGroup(
  item: MenuItemGroup | MenuItemGroupBuilder,
  index: number,
  path: SerializePath
): MenuItemGroup {
  return item instanceof MenuItemGroupBuilder ? item.serialize({path, index}) : item
}

function maybeSerializeMenuItem(
  item: MenuItem | MenuItemBuilder,
  index: number,
  path: SerializePath
): MenuItem {
  return item instanceof MenuItemBuilder ? item.serialize({path, index}) : item
}

function noChildResolver() {
  return undefined
}

export interface GenericList extends StructureNode {
  menuItems: MenuItem[]
  menuItemGroups: MenuItemGroup[]
  defaultLayout?: Layout
  canHandleIntent?: IntentChecker
  resolveChildForItem: ChildResolver
}

export interface PartialGenericList {
  id?: string
  title?: string
  menuItems?: (MenuItem | MenuItemBuilder)[]
  menuItemGroups?: (MenuItemGroup | MenuItemGroupBuilder)[]
  defaultLayout?: Layout
  canHandleIntent?: IntentChecker
  resolveChildForItem?: ChildResolver
}

export abstract class GenericListBuilder<L extends PartialGenericList> implements Serializable {
  protected intentChecker?: IntentChecker

  constructor(protected spec: L) {}

  id(id: string) {
    this.spec.id = id
    return this
  }

  title(title: string) {
    this.spec.title = title
    return this
  }

  layout(layout: Layout) {
    this.spec.defaultLayout = layout
    return this
  }

  menuItems(items: (MenuItem | MenuItemBuilder)[]) {
    this.spec.menuItems = items
    return this
  }

  menuItemGroups(groups: (MenuItemGroup | MenuItemGroupBuilder)[]) {
    this.spec.menuItemGroups = groups
    return this
  }

  childResolver(resolver: ChildResolver) {
    this.spec.resolveChildForItem = resolver
    return this
  }

  canHandleIntent(checker: IntentChecker) {
    this.intentChecker = checker
    return this
  }

  serialize(options: SerializeOptions): GenericList {
    const id = this.spec.id || ''
    const path = options.path

    const defaultLayout = this.spec.defaultLayout
    if (defaultLayout && !LayoutOptions.includes(defaultLayout)) {
      throw new SerializeError(
        `\`layout\` must be one of ${LayoutOptions.map(item => `"${item}"`).join(', ')}`,
        path,
        id || options.index,
        this.spec.title
      )
    }

    return {
      id,
      title: this.spec.title,
      type: 'genericList',
      defaultLayout,
      resolveChildForItem: this.spec.resolveChildForItem || noChildResolver,
      canHandleIntent: this.intentChecker,
      menuItems: (this.spec.menuItems || []).map((item, i) =>
        maybeSerializeMenuItem(item, i, path)
      ),
      menuItemGroups: (this.spec.menuItemGroups || []).map((item, i) =>
        maybeSerializeMenuItemGroup(item, i, path)
      )
    }
  }
}