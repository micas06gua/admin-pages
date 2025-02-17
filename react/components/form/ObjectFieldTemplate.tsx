import React, { Fragment } from 'react'
import { ObjectFieldTemplateProps } from 'react-jsonschema-form'

import { ComponentEditorFormContext } from '../EditorContainer/Sidebar/typings'

const hasFieldToBeDisplayed = (
  field: ComponentSchema,
  formContext: ComponentEditorFormContext
): boolean => {
  if (!formContext.isLayoutMode) {
    return true
  }

  const isLayoutMode = formContext.isLayoutMode

  if (field.type !== 'object') {
    return field.isLayout === isLayoutMode
  }

  return Object.values(field.properties || {}).reduce(
    (acc: boolean, currValue) =>
      hasFieldToBeDisplayed(currValue, {
        isLayoutMode,
      }) || acc,
    false
  )
}

const ObjectFieldTemplate: React.FunctionComponent<
  ObjectFieldTemplateProps
> = ({ formContext, properties, schema }) =>
  hasFieldToBeDisplayed(schema as ComponentSchema, formContext) ? (
    <Fragment>{properties.map(property => property.content)}</Fragment>
  ) : null

ObjectFieldTemplate.defaultProps = {
  properties: [],
}

export default ObjectFieldTemplate
