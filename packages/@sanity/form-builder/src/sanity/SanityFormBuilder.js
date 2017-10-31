// @flow
import React from 'react'
import SanityFormBuilderContext from './SanityFormBuilderContext'
import {FormBuilderInput} from '../FormBuilderInput'
import FocusManager from './FocusManager'

type PatchChannel = {
  subscribe: () => () => {},
  receivePatches: (patches: Array<*>) => void
}

type Props = {
  value: ?any,
  schema: any,
  type: Object,
  patchChannel: PatchChannel,
  onChange: () => {}
}

export default function SanityFormBuilder(props: Props) {
  return (
    <SanityFormBuilderContext
      value={props.value}
      schema={props.schema}
      patchChannel={props.patchChannel}
    >
      <FocusManager>
        {({onFocus, onBlur, focusPath}) => (
          <FormBuilderInput
            type={props.type}
            onChange={props.onChange}
            level={0}
            value={props.value}
            onFocus={onFocus}
            onBlur={onBlur}
            focusPath={focusPath}
            isRoot
          />
        )}
      </FocusManager>
    </SanityFormBuilderContext>
  )
}

SanityFormBuilder.createPatchChannel = SanityFormBuilderContext.createPatchChannel
