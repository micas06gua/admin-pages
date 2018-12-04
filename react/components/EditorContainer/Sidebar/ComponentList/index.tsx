import { equals, findIndex, last } from 'ramda'
import React, { Component, Fragment } from 'react'

import { arrayMove, SortEndHandler, SortStartHandler } from 'react-sortable-hoc'

import { SidebarComponent } from '../typings'

import SortableList from './SortableList'
import { NormalizedComponent } from './typings'
import { getParentTreePath, normalizeComponents } from './utils'

interface Props {
  components: SidebarComponent[]
  editor: EditorContext
  highlightExtensionPoint: (treePath: string | null) => void
  iframeRuntime: RenderContextProps['runtime']
  onMouseEnterComponent: (event: React.MouseEvent<HTMLButtonElement>) => void
  onMouseLeaveComponent: () => void
}

interface State {
  components: NormalizedComponent[]
  isSorting: boolean
  initialComponents: SidebarComponent[]
}

class ComponentList extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      components: normalizeComponents(props.components),
      initialComponents: props.components,
      isSorting: false,
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (!equals(nextProps.components, this.state.initialComponents)) {
      this.setState({
        components: normalizeComponents(nextProps.components),
        initialComponents: nextProps.components,
      })
    }
  }

  public render() {
    const { editor, onMouseEnterComponent, onMouseLeaveComponent } = this.props

    const isSortable = editor.mode === 'layout'

    return (
      <Fragment>
        <div className="bb bw1 b--light-silver" />
        <SortableList
          components={this.state.components}
          isSortable={isSortable}
          isSorting={this.state.isSorting}
          lockAxis="y"
          onEdit={this.handleEdit}
          onMouseEnter={onMouseEnterComponent}
          onMouseLeave={onMouseLeaveComponent}
          onSortEnd={this.handleSortEnd}
          onSortStart={this.handleSortStart}
          useDragHandle={isSortable}
        />
      </Fragment>
    )
  }

  private handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { editor, highlightExtensionPoint } = this.props

    const treePath = event.currentTarget.getAttribute('data-tree-path')

    editor.editExtensionPoint(treePath as string)

    highlightExtensionPoint(null)
  }

  private handleSortEnd: SortEndHandler = ({ oldIndex, newIndex }) => {
    const firstTargetParentTreePath = getParentTreePath(
      this.state.components[oldIndex].treePath,
    )
    const secondTargetParentTreePath = getParentTreePath(
      this.state.components[newIndex].treePath,
    )

    const firstTargetName = last(
      this.state.components[oldIndex].treePath.split('/'),
    )
    const secondTargetName = last(
      this.state.components[newIndex].treePath.split('/'),
    )

    const isSameTree = firstTargetParentTreePath === secondTargetParentTreePath
    const isChangingSameExtensionPoint = firstTargetName === secondTargetName

    if (isSameTree && !isChangingSameExtensionPoint) {
      const extension: Extension = this.props.iframeRuntime.extensions[
        firstTargetParentTreePath
      ]

      const firstTargetIndex = findIndex(
        equals(firstTargetName),
        extension.props.elements,
      )
      const secondTargetIndex = findIndex(
        equals(secondTargetName),
        extension.props.elements,
      )

      const newOrder = arrayMove(
        extension.props.elements,
        firstTargetIndex,
        secondTargetIndex,
      )

      this.props.iframeRuntime.updateExtension(firstTargetParentTreePath, {
        ...extension,
        props: {
          ...extension.props,
          elements: newOrder,
        },
      })

      this.setState({
        components: arrayMove(this.state.components, oldIndex, newIndex),
        isSorting: false,
      })

    } else {
      this.setState({
        isSorting: false,
      })
    }
  }

  private handleSortStart: SortStartHandler = () => {
    this.setState({ isSorting: true })
  }
}

export default ComponentList