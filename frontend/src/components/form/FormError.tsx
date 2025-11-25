import React from 'react'
import {
  FieldPath,
  FieldValues,
  get,
  useFormContext,
} from 'react-hook-form'

export interface FormErrorProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>
  className?: string
}

export function FormError<TFieldValues extends FieldValues = FieldValues>({
  name,
  className = 'mt-1 text-xs text-error-600',
}: FormErrorProps<TFieldValues>) {
  const { formState } = useFormContext<TFieldValues>()
  const error = get(formState.errors, name)

  if (!error?.message) {
    return null
  }

  return <p className={className}>{String(error.message)}</p>
}


