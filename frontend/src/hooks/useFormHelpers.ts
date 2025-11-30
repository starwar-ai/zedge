import { useCallback, useState } from 'react'
import {
  FieldValues,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'

export function useFormSubmit<TFieldValues extends FieldValues>(
  methods: UseFormReturn<TFieldValues>,
  handler: SubmitHandler<TFieldValues>,
) {
  const [submitting, setSubmitting] = useState(false)

  const wrappedHandler = useCallback(
    async (values: TFieldValues) => {
      setSubmitting(true)
      try {
        await handler(values)
      } finally {
        setSubmitting(false)
      }
    },
    [handler],
  )

  const onSubmit = methods.handleSubmit(wrappedHandler)

  const resetForm = useCallback(() => {
    methods.reset()
  }, [methods])

  return {
    submitting,
    onSubmit,
    submitHandler: wrappedHandler,
    resetForm,
  }
}


