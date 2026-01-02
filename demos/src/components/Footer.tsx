export const Footer = () => {
  return (
    <footer className="bg-surface-500/30 py-3 px-4 border-t border-surface-600 backdrop-blur">
      <div className="w-full max-w-7xl m-auto flex flex-row justify-between items-center">
        {/* Logo and Links */}
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/ArcStackLab"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <img
              src="/arcstack.jpg"
              alt="ArcStackLab"
              className="size-10 rounded-full"
            />
          </a>
          {/* Nav */}
          <nav className="flex items-center gap-4 text-sm">
            <a
              href="https://github.com/ArcStackLab/ArcStackLab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/60 hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/org/arcstack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/60 hover:text-primary transition-colors"
            >
              NPM
            </a>
            <a
              href="https://jsr.io/@arcstack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/60 hover:text-primary transition-colors"
            >
              JSR
            </a>
          </nav>
        </div>

        {/* Made with love */}
        <p className="text-sm text-primary/50">
          Made with <span className="text-red-500">♥️</span> ArcStackLab
        </p>
      </div>
    </footer>
  )
}
