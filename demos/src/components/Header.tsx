import { GithubIcon } from '../assets/icons/github'
import { JSRIcon } from '../assets/icons/jsr'
import { NPMIcon } from '../assets/icons/npm'

export const Header = () => {
  return (
    <header className="bg-surface-600/30 py-3 px-4 border-b border-surface-800 sticky top-0 backdrop-blur">
      <nav className="flex flex-row justify-between items-center m-auto max-w-7xl w-full flex-wrap">
        <a className="flex flex-row gap-4 items-center" href="/">
          <img
            alt="Web APIs Logo"
            src="/icon.png"
            className="w-12 h-12 aspect-square rounded-2xl"
          />
          <h1 className="font-mono text-xl">Web APIs Demo</h1>
        </a>
        <div className="flex flex-row gap-4 items-center justify-end w-full min-[450px]:w-fit">
          <a
            href="https://github.com/ArcStackLab/webapis"
            title="Github: @arcstack/webapis"
            target="_blank"
            className="hover:text-primary/80"
          >
            <GithubIcon size={30} />
          </a>
          <a
            href="https://www.npmjs.com/package/@arcstack/webapis"
            title="NPM: @arcstack/webapis"
            target="_blank"
            className="hover:text-primary/80"
          >
            <NPMIcon size={24} />
          </a>
          <a
            href="https://jsr.io/@arcstack/webapis"
            title="JSR: @arcstack/webapis"
            target="_blank"
            className="hover:text-primary/80"
          >
            <JSRIcon size={24} />
          </a>
        </div>
      </nav>
    </header>
  )
}
