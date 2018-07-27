import PropTypes from 'prop-types'
import React, { Component, CSSProperties } from 'react'

const DEFAULT_HIGHLIGHT_RECT = { x: 0, y: 0, width: 0, height: 0 }

const updateDefaultHighlightRect = (e: any) => {
  const provider = document.querySelector('.render-provider')
  const providerRect = provider && provider.getBoundingClientRect() as DOMRect

  DEFAULT_HIGHLIGHT_RECT.y = e.pageY + (providerRect ? -providerRect.y : 0)
  DEFAULT_HIGHLIGHT_RECT.x = e.pageX + (providerRect ? -providerRect.x : 0)
}

interface HighlightOverlayProps {
  editMode: boolean,
  treePath: string | null,
  editExtensionPoint: (treePath: string | null) => void,
}

interface HighlightOverlayState {
  treePath: string | null,
}

export default class HighlightOverlay extends Component<HighlightOverlayProps, HighlightOverlayState> {
  public static propTypes = {
    editMode: PropTypes.bool,
    treePath: PropTypes.string,
  }

  public highlightRemovalTimeout: any

  constructor(props: any) {
    super(props)

    this.highlightRemovalTimeout = null

    this.state = {
      treePath: null,
    }
  }

  public componentDidUpdate() {
    document.onmousemove = updateDefaultHighlightRect
    this.updateExtensionPointDOMElements(this.props.editMode)
  }

  public updateExtensionPointDOMElements = (editMode: boolean) => {
    const elements = Array.from(document.querySelectorAll(`[data-extension-point]`))
    elements.forEach((e: Element) => {
      const element = e as HTMLElement
      if (editMode) {
        element.addEventListener('mouseover', this.handleMouseOverHighlight as any)
        element.addEventListener('mouseleave', this.handleMouseLeaveHighlight)
        element.addEventListener('click', this.handleClickHighlight)
        element.style.cursor = 'pointer'
      } else {
        element.removeEventListener('mouseover', this.handleMouseOverHighlight as any)
        element.removeEventListener('mouseleave', this.handleMouseLeaveHighlight)
        element.removeEventListener('click', this.handleClickHighlight)
        element.style.cursor = null
      }
    })
  }

  public highlightExtensionPoint = () => {
    const treePath = this.state.treePath || this.props.treePath

    if (!treePath) {
      return null
    }

    const element = document.querySelector(`[data-extension-point="${treePath}"]`)
    const provider = document.querySelector('.render-provider')
    if (element && provider) {
      const rect = element.getBoundingClientRect() as DOMRect
      const providerRect = provider.getBoundingClientRect() as DOMRect

      // Add offset from render provider main div
      rect.y += -providerRect.y
      rect.x += -providerRect.x
      return rect
    }
  }

  public handleMouseOverHighlight = (e: any) => {
    if (!e.currentTarget) {
      return
    }

    const treePath = e.currentTarget.getAttribute('data-extension-point')
    this.setState({
      treePath
    })

    clearTimeout(this.highlightRemovalTimeout)
    e.stopPropagation()
  }

  public handleMouseLeaveHighlight = () => {
    if (this.highlightRemovalTimeout) {
      clearTimeout(this.highlightRemovalTimeout)
    }

    this.highlightRemovalTimeout = setTimeout(this.tryRemoveHighlight, 300)
  }

  public tryRemoveHighlight = () => {
    this.setState({
      treePath: null
    })
  }

  public handleClickHighlight = (e: any) => {
    if (!e.currentTarget) {
      return
    }

    e.preventDefault()
    e.stopPropagation()
    this.props.editExtensionPoint(this.state.treePath)
    this.setState({
      treePath: null
    })
  }

  public render() {
    const highlight = this.highlightExtensionPoint()
    const { x: left, y: top, width, height } = highlight || DEFAULT_HIGHLIGHT_RECT
    const highlightStyle: CSSProperties = {
      animationDuration: '0.6s',
      height,
      left,
      pointerEvents: 'none',
      top,
      transition: highlight ? 'top 0.3s, left 0.3s, width 0.3s, height 0.3s' : undefined,
      width,
      zIndex: 999,
    }

    return (
      <div id="editor-provider-overlay" style={highlightStyle} className={`absolute ${highlight ? 'br2 b--blue b--dashed ba bg-light-blue o-50' : ''}`} />
    )
  }
}
