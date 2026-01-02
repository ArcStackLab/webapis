import { Button } from '@headlessui/react'
import { SystemIcon } from '../assets/icons/system'
import { useTheme, type Theme } from '../hooks/themeHooks'
import type { ReactNode } from 'react'
import { LightIcon } from '../assets/icons/light'
import { DarkIcon } from '../assets/icons/dark'

export const ThemeToggle = () => {
  const theme = useTheme()

  const icons: Record<Theme, ReactNode> = {
    system: <SystemIcon size={40} />,
    light: <DarkIcon size={40} />,
    dark: <LightIcon size={40} />
  }

  return (
    <div className="sticky top-[calc(100vh-88px)] bottom-0 flex flex-row items-center justify-end">
      <Button
        title="Theme Toggle"
        onClick={theme.toggle}
        className="cursor-pointer rounded-full bg-primary-600 text-surface p-2 data-active:bg-primary-700 data-disabled:bg-primary-500/10 data-hover:bg-primary-500/80"
      >
        {icons[theme.mode]}
      </Button>
    </div>
  )
}
