import { Description, Field, Input } from '@headlessui/react'
import clsx from 'clsx'
import { useSearchParam } from '../hooks/searchParamHooks'
import { useRef, type ChangeEvent } from 'react'

export const SearchFilter = () => {
  const timeoutRef = useRef<number>(undefined)
  const searchParam = useSearchParam('search')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      searchParam.setValue(value)
      timeoutRef.current = undefined
    }, 300)
  }

  return (
    <Field className="mb-4">
      <Input
        className={clsx(
          'block w-full rounded-lg border-none bg-surface px-3 py-1.5 text-base/6 text-primary',
          'outline-primary/30 outline-2 -outline-offset-2 data-focus:outline-primary/80 placeholder:text-primary/25'
        )}
        type="search"
        placeholder="Search by Package name"
        name="searchFilter"
        onChange={handleChange}
        defaultValue={searchParam.value ?? ''}
      />
      <Description className="text-sm/6 text-primary/50 italic">
        Packages are sorted alphabetically [A-Z]
      </Description>
    </Field>
  )
}
