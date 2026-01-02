import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { SearchFilter } from './components/SearchFilter'
import { ThemeToggle } from './components/ThemeToggle'
import { Packages } from './components/Packages'
import { PackageModal } from './components/PackageModal'
import { useSearchParam } from './hooks/searchParamHooks'
import { useEffect } from 'react'

function App() {
  const refParam = useSearchParam('ref')

  useEffect(() => {
    if (refParam.value) {
      const url = new URL(refParam.value)
      const destUrl = new URL(location.href)
      destUrl.searchParams.delete('ref')
      destUrl.searchParams.set('package', url.hostname)
      location.replace(destUrl)
    }
  }, [refParam.value])

  return (
    <>
      <Header />
      <main className="min-h-screen py-15 px-4">
        <div className="w-full min-h-screen max-w-7xl m-auto flex flex-col gap-4">
          <SearchFilter />
          <Packages />
          <PackageModal />
          <ThemeToggle />
        </div>
      </main>
      <Footer />
    </>
  )
}

export default App
