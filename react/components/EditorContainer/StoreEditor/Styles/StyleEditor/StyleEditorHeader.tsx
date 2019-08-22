import { useKeydownFromClick } from 'keydown-from-click'
import React, { useCallback } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { Button, IconArrowBack } from 'vtex.styleguide'

interface Props extends RouteComponentProps {
  buttonLabel?: string | React.ReactNode
  onButtonClick?: () => void
  afterOnBack?: () => void
  title: string | React.ReactNode
}

const StyleEditorHeader: React.FunctionComponent<Props> = ({
  afterOnBack,
  buttonLabel,
  children,
  history,
  onButtonClick,
  title,
}) => {
  const onBack = useCallback(() => {
    history.goBack()
    if (afterOnBack) {
      afterOnBack()
    }
  }, [history, afterOnBack])

  const onBackByKeyDown = useKeydownFromClick(onBack)

  return (
    <div className="mh6 mt6">
      <div className="flex justify-between items-center mv4">
        <div className="flex items-center">
          <div
            className="pointer f3 ph4 outline-0"
            onClick={onBack}
            onKeyDown={onBackByKeyDown}
            role="button"
            tabIndex={0}
          >
            <IconArrowBack />
          </div>
          <span className="f3">{title}</span>
        </div>
        {buttonLabel && (
          <Button
            variation="tertiary"
            size="small"
            onClick={onButtonClick}
            disabled={!onButtonClick}
          >
            {buttonLabel}
          </Button>
        )}
        {children}
      </div>
    </div>
  )
}

export default withRouter(StyleEditorHeader)
