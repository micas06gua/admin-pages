import {
  AtomicBlockUtils,
  CompositeDecorator,
  Editor,
  EditorState,
  RichUtils,
} from 'draft-js'
import * as React from 'react'

import {
  IconBold,
  IconItalic,
  IconOrderedList,
  IconUnderline,
  IconUnorderedList,
} from 'vtex.styleguide'

import styles from './style.css'

import ImageInput from './ImageInput'
import Link from './Link'
import LinkInput from './LinkInput'
import StyleButton from './StyleButton'

import { convertToMarkdown, findLinkEntities, mediaBlockRenderer } from './utils'

const INLINE_STYLES = [
  { label: <IconBold />, style: 'BOLD' },
  { label: <IconItalic />, style: 'ITALIC' },
  { label: <IconUnderline />, style: 'UNDERLINE' },
]

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: <IconUnorderedList />, style: 'unordered-list-item' },
  { label: <IconOrderedList />, style: 'ordered-list-item' },
]

const BlockStyleControls = (props: any) => {
  const { editorState } = props
  const selection = editorState.getSelection()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()

  return (
    <>
      {BLOCK_TYPES.map((type, i) =>
        <StyleButton
          key={i}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </>
  )
}

const InlineStyleControls = (props: any) => {
  const { editorState } = props
  const currentStyle = editorState.getCurrentInlineStyle()
  
  return (
    <>
      {INLINE_STYLES.map((type, i) =>
        <StyleButton
          key={i}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </>
  )
}

interface Props {
  onChange?: (value: string) => void
}
const RichTextEditor = ({ onChange }: Props) => {
  const decorator = new CompositeDecorator([{ strategy: findLinkEntities, component: Link }])
  const [editorState, setEditorState] = React.useState(EditorState.createEmpty(decorator))

  let className = `${styles.RichEditor_editor}`
  const contentState = editorState.getCurrentContent()
  if (!contentState.hasText()) {
    if (contentState.getBlockMap().first().getType() !== 'unstyled') {
      className += ` ${styles.RichEditor_hidePlaceholder}`
    }
  }

  const handleAddImage = (imageLink: string) => {
    const currentContentState = editorState.getCurrentContent()
    const contentStateWithEntity = currentContentState.createEntity(
      'image',
      'IMMUTABLE',
      { src: imageLink }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity })
    return setEditorState(AtomicBlockUtils.insertAtomicBlock(
      newEditorState,
      entityKey,
      ' '
    ))
  }

  const handleAddLink = (linkUrl: string) => {
    const currentContentState = editorState.getCurrentContent()
    const contentStateWithEntity = currentContentState.createEntity(
      'LINK',
      'IMMUTABLE',
      { url: linkUrl }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity })
    return setEditorState(RichUtils.toggleLink(
      newEditorState,
      newEditorState.getSelection(),
      entityKey
    ))
  }

  const handleChange = (state: EditorState) => {
    if (onChange) {
      onChange(convertToMarkdown(state))
    }

    return setEditorState(state)
  }

  const toggleBlockType = (blockType: string) => {
    handleChange(
      RichUtils.toggleBlockType(
        editorState,
        blockType
      )
    )
  }

  const toggleInlineStyle = (inlineStyle: string) => {
    handleChange(
      RichUtils.toggleInlineStyle(
        editorState,
        inlineStyle
      )
    )
  }

  return (
    <div className="bw1 br2 b--solid b--muted-4">
      <div className="pa4 flex flex-wrap-s">
        <InlineStyleControls editorState={editorState} onToggle={toggleInlineStyle} />
        <BlockStyleControls editorState={editorState} onToggle={toggleBlockType} />
        <LinkInput onAdd={handleAddLink} />
        <ImageInput onAdd={handleAddImage} />
      </div>
      <div className={className}>
        <Editor
          editorState={editorState}
          onChange={(state) => handleChange(state)}
          blockRendererFn={mediaBlockRenderer}
        />
      </div>
    </div>
  )
}

export default RichTextEditor