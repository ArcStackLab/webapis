import { useSearchParam } from '../hooks/searchParamHooks'

interface PermissionsCardProps {
  name: string
  id: string
  description: string
  author: string
  version: string
  url: string
}

export function PermissionsCard({
  name,
  id,
  description,
  author,
  version
}: PermissionsCardProps) {
  const packageParam = useSearchParam('package')

  const handleCardClick = (packageName: string) => () => {
    packageParam.setValue(packageName)
  }

  return (
    <div
      onClick={handleCardClick(name)}
      className="group cursor-pointer flex flex-col h-full rounded-lg border border-surface-700 bg-surface text-primary shadow-sm transition-all duration-200 hover:shadow-lg hover:border-surface-800"
    >
      {/* Header */}
      <div className="p-6 pb-4 space-y-1">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h3 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="font-mono text-sm text-primary/80 truncate">{id}</p>
          </div>
          <span className="shrink-0 inline-flex items-center rounded-md bg-surface-600 px-2.5 py-0.5 text-xs font-mono font-medium text-primary">
            v{version}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4 flex-1">
        <p className="text-primary/50 text-sm leading-relaxed">{description}</p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-surface-700 mt-auto">
        <a
          href={`https://github.com/${author}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex group items-center gap-2 text-sm transition-colors"
        >
          <img
            src={`https://unavatar.io/github/${author}`}
            alt={author}
            className="size-9 group-hover:border-surface-950 rounded-full bg-surface-700 border border-surface-700"
          />
          <span className="font-medium text-primary/50 group-hover:text-primary">
            {author}
          </span>
        </a>
      </div>
    </div>
  )
}
