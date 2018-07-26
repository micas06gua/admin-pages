import React from 'react'
import { injectIntl } from 'react-intl'

import Dropdown from '../../form/Dropdown'

const SITE_SCOPE_CONDITION = {
  label: 'pages.conditions.scope.site',
  value: 'site',
}

const SCOPE_CONDITIONS = [
  {
    label: 'pages.conditions.scope.url',
    value: 'url',
  },
  {
    label: 'pages.conditions.scope.route',
    value: 'route',
  }
]

interface ScopeSelectorProps {
  intl: ReactIntl.InjectedIntl
  onChange: (value: ConfigurationScope) => void
  shouldEnableSite: boolean
  value: string
}

const ScopeSelector: React.StatelessComponent<ScopeSelectorProps> = ({
  intl,
  onChange,
  shouldEnableSite,
  value,
}) => (
  <Dropdown
    label={intl.formatMessage({ id: 'pages.editor.components.conditions.native.label' })}
    onChange={onChange}
    options={{ enumOptions: shouldEnableSite
      ? [...SCOPE_CONDITIONS, SITE_SCOPE_CONDITION]
      : SCOPE_CONDITIONS
    }}
    value={value}
  />
)

export default injectIntl(ScopeSelector)
