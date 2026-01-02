import { useMemo } from 'react'
import { useSearchParam } from '../hooks/searchParamHooks'
import packages from '../../packages.json'
import { PermissionsCard } from './PackageCard'

export const Packages = () => {
  const search = useSearchParam('search')
  const cards = useMemo(() => {
    if (search.value) {
      const str = search.value
      return packages.filter((item) =>
        item.name.toLowerCase().includes(str.toLowerCase())
      )
    }

    return packages
  }, [search.value])

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Packages</h1>
      {cards.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <PermissionsCard key={card.id} {...card} />
          ))}
        </div>
      ) : (
        <span className="text-center font-mono text-xl italic text-primary/50 block">
          No match found
        </span>
      )}
    </div>
  )
}
