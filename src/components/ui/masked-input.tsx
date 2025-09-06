import React, { forwardRef, useState, useEffect } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value = '', onChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('')

    const applyMask = (inputValue: string, maskPattern: string): string => {
      const digits = inputValue.replace(/\D/g, '')
      let result = ''
      let digitIndex = 0

      for (let i = 0; i < maskPattern.length && digitIndex < digits.length; i++) {
        const maskChar = maskPattern[i]
        if (maskChar === '9') {
          result += digits[digitIndex]
          digitIndex++
        } else if (maskChar === '*') {
          // For ID last character, accept letters or numbers
          const char = inputValue.replace(/[^\w]/g, '')[digitIndex]
          if (char) {
            result += char
            digitIndex++
          }
        } else {
          result += maskChar
        }
      }

      return result
    }

    const removeMask = (maskedValue: string): string => {
      // Remove all non-alphanumeric characters for clean value
      return maskedValue.replace(/[^\w]/g, '')
    }

    useEffect(() => {
      if (value) {
        setDisplayValue(applyMask(value, mask))
      } else {
        setDisplayValue('')
      }
    }, [value, mask])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value
      const maskedValue = applyMask(inputValue, mask)
      const cleanValue = removeMask(maskedValue)

      setDisplayValue(maskedValue)

      if (onChange) {
        // Create a synthetic event with the clean value
        const syntheticEvent = {
          ...event,
          target: {
            ...event.target,
            value: cleanValue
          }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    }

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        className={cn(className)}
      />
    )
  }
)

MaskedInput.displayName = 'MaskedInput'

export { MaskedInput }