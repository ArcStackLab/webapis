import { createContext } from 'react'

export const SearchParamContext = createContext<
  [URL, React.Dispatch<React.SetStateAction<URL>>]
>([new URL(location.href)] as never)
