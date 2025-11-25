import React from 'react'
import {
  FieldValues,
  FormProvider as RHFProvider,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'

export interface ControlledFormProps<TFieldValues extends FieldValues>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  methods: UseFormReturn<TFieldValues>
  onSubmit: SubmitHandler<TFieldValues>
  children: React.ReactNode
}

export function ControlledForm<TFieldValues extends FieldValues>({
  methods,
  onSubmit,
  children,
  className,
  ...rest
}: ControlledFormProps<TFieldValues>) {
  return (
    <RHFProvider {...methods}>
      <form
        className={className}
        onSubmit={methods.handleSubmit(onSubmit)}
        {...rest}
      >
        {children}
      </form>
    </RHFProvider>
  )
}


