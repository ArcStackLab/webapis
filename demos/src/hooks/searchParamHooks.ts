import { useCallback, useContext, useEffect } from 'react'
import { SearchParamContext } from '../contexts'

interface ParamHandle<V> {
  value: V | null
  setValue: (value: V | string) => void
  appendValue: (value: V | string) => void
  removeValue: () => void
  values: V[]
}

interface SearchParamHandler {
  setParam: (paramKey: string, value: string) => void
  appendParam: (paramKey: string, value: string) => void
  removeParam: (paramKey: string) => void
  getAll: (paramKey: string) => string[]
  get: (paramKey: string) => string | null
}

export function useSearchParamHandler(): SearchParamHandler {
  return {
    setParam(paramKey: string, value: string) {
      const newUrl = new URL(location.href)
      newUrl.searchParams.set(paramKey, value)
      history.pushState(newUrl.href, '', newUrl)
    },
    appendParam(paramKey: string, value: string) {
      const newUrl = new URL(location.href)
      newUrl.searchParams.append(paramKey, value)
      history.pushState(newUrl.href, '', newUrl)
    },
    removeParam(paramKey: string) {
      const newUrl = new URL(location.href)
      newUrl.searchParams.delete(paramKey)
      history.pushState(newUrl.href, '', newUrl)
    },
    getAll(paramKey: string) {
      const url = new URL(location.href)
      return url.searchParams.getAll(paramKey)
    },
    get(paramKey: string) {
      const url = new URL(location.href)
      return url.searchParams.get(paramKey)
    }
  }
}

export function useSearchParam<V = string>(
  key: string,
  parser?: (data: string) => V
): ParamHandle<V> {
  const [url, setUrl] = useContext(SearchParamContext)

  const popStateEventHandler = useCallback(
    (event: PopStateEvent) => {
      const state: string = event.state
      setUrl(new URL(state))
    },
    [setUrl]
  )

  useEffect(() => {
    window.addEventListener('popstate', popStateEventHandler, { passive: true })

    return () => window.removeEventListener('popstate', popStateEventHandler)
  }, [popStateEventHandler])

  const handleSetValue = useCallback(
    (value: V | string) => {
      const newUrl = new URL(url)
      if (value) newUrl.searchParams.set(key, String(value))
      else newUrl.searchParams.delete(key)
      history.pushState(newUrl.href, '', newUrl)
      setUrl(newUrl)
    },
    [url, key, setUrl]
  )

  const handleAppendValue = useCallback(
    (value: V | string) => {
      const newUrl = new URL(url)
      newUrl.searchParams.append(key, String(value))
      history.pushState(newUrl.href, '', newUrl)
      setUrl(newUrl)
    },
    [url, key, setUrl]
  )

  const handleRemoveValue = useCallback(() => {
    const newUrl = new URL(url)
    newUrl.searchParams.delete(key)
    history.pushState(newUrl.href, '', newUrl)
    setUrl(newUrl)
  }, [url, key, setUrl])

  const data = url.searchParams.get(key)
  const allData = url.searchParams.getAll(key)
  const parseData = parser ?? String

  return {
    value: data ? (parseData(data) as V) : null,
    setValue: handleSetValue,
    appendValue: handleAppendValue,
    removeValue: handleRemoveValue,
    values: allData.map((item) => parseData(item) as V)
  }
}
