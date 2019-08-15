import React, { Dispatch, SetStateAction, useCallback } from 'react'
import { DropzoneOptions, useDropzone } from 'react-dropzone'
import {
  defineMessages,
  FormattedMessage,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl'
import {
  ActionMenu,
  ButtonWithIcon,
  Dropdown,
  IconOptionsDots,
  IconUpload,
  Input,
  ToastConsumerFunctions,
} from 'vtex.styleguide'

import { FontFileInput, FontFileUpload } from '../mutations/SaveFontFamily'
import {
  flavourToString,
  FONT_FILE_EXTENSIONS,
  FontFlavour,
  getFontFlavour,
  MEGA,
  stringToFlavour,
  STYLE_FLAVOUR_OPTIONS,
} from '../utils/typography'
import { FontFileAction } from './FontEditor'

const { pickStylePlaceholder, removeMessage } = defineMessages({
  pickStylePlaceholder: {
    defaultMessage: 'Pick a style',
    id: 'admin/pages.editor.styles.edit.font-family.style-dropdown-placeholder',
  },
  removeMessage: {
    defaultMessage: 'Remove',
    id: 'admin/pages.admin.redirects.form.button.remove',
  },
})

interface FileFontEditorProps extends InjectedIntlProps {
  familyState: [string, Dispatch<SetStateAction<string>>]
  filesReducer: [FontFileInput[], Dispatch<FontFileAction>]
  showToast: ToastConsumerFunctions['showToast']
}

const FileFontEditor: React.FunctionComponent<FileFontEditorProps> = ({
  filesReducer,
  familyState,
  intl,
  showToast,
}) => {
  const [files, dispatchFiles] = filesReducer
  const [family, setFamily] = familyState

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setFamily(e.target.value),
    [setFamily]
  )

  const removeFile = (index: number) => dispatchFiles({ type: 'remove', index })

  const updateFile = (index: number, style: FontFlavour) =>
    dispatchFiles({ type: 'update', index, style })

  const onDrop = (acceptedFiles: File[], rejectedFiles: File[]): void => {
    if (rejectedFiles.length > 0) {
      showToast(
        'Uploaded files must be under 2MB and have one of the extensions: ' +
          FONT_FILE_EXTENSIONS.join(' ')
      )
    }

    if (acceptedFiles.length > 0) {
      dispatchFiles({
        files: acceptedFiles.map(fontFile => ({ fontFile })),
        type: 'append',
      })
    }
  }

  const isUpload = (file: FontFileInput): file is FontFileUpload =>
    (file as FontFileUpload).fontFile != null

  const getFileName = (file: FontFileInput): string =>
    isUpload(file) ? file.fontFile.name : file.filename

  return (
    <div className="mv6 w-100">
      <FormattedMessage
        id="admin/pages.editor.styles.edit.font-family.title"
        defaultMessage="Font Family"
      >
        {label => (
          <Input
            size="small"
            label={label}
            value={family}
            onChange={onInputChange}
          />
        )}
      </FormattedMessage>
      {files.map((file, index) => (
        <FontFileItem
          fileName={getFileName(file)}
          key={getFileName(file)}
          intl={intl}
          onRemove={() => removeFile(index)}
          onStyleUpdate={(style: FontFlavour) => updateFile(index, style)}
          style={getFontFlavour(files[index])}
        />
      ))}
      <FontFileUploadComponent onDrop={onDrop} />
    </div>
  )
}

interface FontFileItemProps extends InjectedIntlProps {
  fileName: string
  onRemove: () => void
  onStyleUpdate: (style: FontFlavour) => void
  style?: FontFlavour
}

const FontFileItem: React.FunctionComponent<FontFileItemProps> = ({
  fileName,
  intl,
  onRemove,
  onStyleUpdate,
  style,
}) => {
  const actionMenuProps = {
    buttonProps: {
      icon: <IconOptionsDots color="currentColor" />,
      variation: 'tertiary',
    },
    options: [
      {
        label: intl.formatMessage(removeMessage),
        onClick: onRemove,
      },
    ],
  }

  const dropdownProps = {
    onChange: (_: React.ChangeEvent, value: string) =>
      onStyleUpdate(stringToFlavour(value)),
    options: STYLE_FLAVOUR_OPTIONS,
    placeholder: intl.formatMessage(pickStylePlaceholder),
    value: flavourToString(style),
    variation: 'inline',
  }

  return (
    <div className="mv5">
      <div className="flex items-center">
        <div className="mv3">{fileName}</div>
        <div className="flex-grow-1" />
        <ActionMenu {...actionMenuProps} />
      </div>
      <div className="flex items-center">
        <FormattedMessage
          id="admin/pages.editor.styles.edit.custom-font.style"
          defaultMessage="Style:"
        />
        <Dropdown {...dropdownProps} />
      </div>
    </div>
  )
}

interface FontFileUploadProps {
  onDrop: DropzoneOptions['onDrop']
}

const FontFileUploadComponent: React.FunctionComponent<FontFileUploadProps> = ({
  onDrop,
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: FONT_FILE_EXTENSIONS,
    maxSize: 2 * MEGA,
    onDrop,
  })
  return (
    <div className="mv6 w-100 flex">
      <p className="t-small">
        <FormattedMessage
          id="admin/pages.editor.styles.edit.custom-font.upload-description"
          defaultMessage="Upload your font family files in .ttf or .woff formats."
        />{' '}
        <span className="c-muted-2">
          <FormattedMessage
            id="admin/pages.editor.styles.edit.custom-font.upload-description-max-size"
            defaultMessage="(Maximum size 2MB)"
          />
        </span>
      </p>
      <div {...getRootProps()}>
        <ButtonWithIcon icon={<IconUpload />} variation="tertiary">
          <FormattedMessage
            id="admin/pages.editor.styles.edit.custom-font.upload"
            defaultMessage="Upload"
          />
          <input {...getInputProps()} />
        </ButtonWithIcon>
      </div>
    </div>
  )
}

export default injectIntl(FileFontEditor)
