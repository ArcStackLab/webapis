import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useSearchParam } from '../hooks/searchParamHooks'
import packages from '../../packages.json'
import { useMemo } from 'react'
import { CloseIcon } from '../assets/icons/close'

export const PackageModal = () => {
  const activePackageName = useSearchParam('package')
  const selectedPackage = useMemo(() => {
    if (activePackageName.value) {
      const name = activePackageName.value.toLowerCase()
      return packages.find((item) => item.name.toLowerCase() === name)
    }

    return null
  }, [activePackageName.value])

  const handleClose = () => {
    activePackageName.removeValue()
  }

  return selectedPackage ? (
    <Dialog open={true} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur"
        aria-hidden="true"
      />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full h-full max-w-7xl max-h-[90vh] bg-surface rounded-lg shadow-2xl flex flex-col overflow-hidden border border-surface-700">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700 shrink-0">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg font-semibold">
                {selectedPackage.name}
              </DialogTitle>
              <span className="font-mono text-sm text-primary/80">
                {selectedPackage.id}
              </span>
              <span className="inline-flex items-center rounded-md bg-surface-600 px-2.5 py-0.5 text-xs font-mono font-medium text-primary">
                v{selectedPackage.version}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="size-8 rounded-full cursor-pointer flex items-center justify-center text-primary/50 hover:text-primary hover:bg-surface-600 transition-colors"
              aria-label="Close modal"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          {/* Iframe */}
          <div className="flex-1 relative bg-white">
            <iframe
              src={`/out/${selectedPackage.url}`}
              title={selectedPackage.name}
              className="absolute inset-0 w-full h-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  ) : null
}
