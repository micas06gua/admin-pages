import * as React from 'react'

import { Media as MediaProps } from 'draft-js'

const Media = (props: MediaProps) => {
  const { contentState, block } = props
  const blockEntity = block.getEntityAt(0)

  if (!blockEntity) {
    return null
  }

  const entity = contentState.getEntity(blockEntity)
  const { src } = entity.getData()
  const type = entity.getType()

  if (type === 'IMAGE') {
    return <img alt={src} src={src} />
  }

  return null
}

export default Media
