import React from 'react'
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  useFormContext,
} from 'react-hook-form'
import { Input, InputProps } from '@/components/ui/Input'

type ControllerPropsWithoutControl<TFieldValues extends FieldValues> = Omit<
  ControllerProps<TFieldValues>,
  'control'
>

export function FormField<TFieldValues extends FieldValues = FieldValues>(
  props: ControllerPropsWithoutControl<TFieldValues>,
) {
  const { control } = useFormContext<TFieldValues>()
  return <Controller {...props} control={control} />
}

type FormInputFieldProps<TFieldValues extends FieldValues> = Omit<
  InputProps,
  'value' | 'onChange' | 'onBlur' | 'name' | 'ref'
> & {
  name: FieldPath<TFieldValues>
}

export function FormInputField<
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  ...inputProps
}: FormInputFieldProps<TFieldValues>) {
  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...inputProps}
          {...field}
          value={field.value ?? ''}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}


