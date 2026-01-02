import { useState, type FC, type PropsWithChildren } from 'react'
import { SearchParamContext } from '../contexts'

export const SearchParamProvider: FC<PropsWithChildren> = ({ children }) => {
  const state = useState(new URL(location.href))

  return (
    <SearchParamContext.Provider value={state}>
      {children}
    </SearchParamContext.Provider>
  )
}
