import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ExtensionPoint} from 'render'

import EditableExtensionPoint from './EditableExtensionPoint'
import {getImplementation} from './utils/components'

class EditorProvider extends Component {
  static childContextTypes = {
    editMode: PropTypes.bool,
    editTreePath: PropTypes.string,
    editExtensionPoint: PropTypes.func,
    extensions: PropTypes.object,
  }

  static contextTypes = {
    components: PropTypes.object,
    extensions: PropTypes.object,
    emitter: PropTypes.object,
    treePath: PropTypes.string,
  }

  static propTypes = {
    children: PropTypes.element.isRequired,
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      editMode: false,
      editTreePath: null,
    }
    this.editableExtensionPointComponent = Object.keys(context.components).find(c => /vtex\.pages-editor@.*\/EditableExtensionPoint/.test(c))
    this.emptyExtensionPointComponent = Object.keys(context.components).find(c => /vtex\.pages-editor@.*\/EmptyExtensionPoint/.test(c))
  }

  getChildContext() {
    return {
      editExtensionPoint: this.editExtensionPoint,
      editMode: this.state.editMode,
      editTreePath: this.state.editTreePath,
      extensions: this.injectEditableExtensionPoints(this.context.extensions),
    }
  }

  getEditableComponents = () => {
    return Object.keys(global.__RUNTIME__.components).filter(component => {
      if (/EmptyExtensionPoint/.test(component)) {
        return false
      }
      const Component = getImplementation(component)
      return Component && Component.schema
    })
  }

  injectEditableExtensionPoints = (extensions) =>
    Object.keys(extensions).reduce((acc, value) => {
      const extension = extensions[value]
      const Component = getImplementation(extension.component)

      if (extension.component === null) {
        acc[value] = {
          ...extension,
          component: [this.emptyExtensionPointComponent, this.editableExtensionPointComponent],
          props: {},
        }
        return acc
      }

      if (Component && Component.schema) {
        acc[value] = {
          ...extension,
          component: [extension.component, this.editableExtensionPointComponent],
        }
      } else {
        acc[value] = extension
      }
      return acc
    }, {})

  editExtensionPoint = (treePath) => {
    this.setState((state) => ({
      ...state,
      editTreePath: treePath,
    }))
  }

  toggleEditMode = () => {
    const {emitter} = this.context
    this.setState({
      ...this.state,
      editMode: !this.state.editMode,
    })
    emitter.emit('extension:*:update')
  }

  render() {
    const {treePath, extensions} = this.context
    const {children, ...parentProps} = this.props
    const {editMode, editTreePath} = this.state
    const editableComponents = this.getEditableComponents()

    const rootExtension = extensions[treePath]
    const component = Array.isArray(rootExtension.component) ? rootExtension.component[0] : rootExtension.component
    const Component = getImplementation(component)
    const isEditable = Component && Component.schema
    const clonedChildren = React.cloneElement(children, parentProps)
    const editableChildren = isEditable && <EditableExtensionPoint>{clonedChildren}</EditableExtensionPoint>

    return (
      <div>
        {editableChildren || clonedChildren}
        {editableComponents.length > 0 && <ExtensionPoint id="editor" toggleEditMode={this.toggleEditMode} editMode={editMode} editTreePath={editTreePath} />}
      </div>
    )
  }
}

export default EditorProvider
