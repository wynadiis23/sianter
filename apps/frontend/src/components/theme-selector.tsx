import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useThemeScheme } from '@/hooks/use-theme-scheme'

export function ThemeSelector() {
  const { setTheme, theme } = useTheme()
  const { scheme, setScheme } = useThemeScheme()

  const isDark = theme === 'dark'

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <span className="text-xs font-medium tabular-nums">
              {scheme === 'kpu' ? 'KPU' : 'DF'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-36">
          <DropdownMenuItem
            onClick={() => setScheme('default')}
          >
            <span className={scheme === 'default' ? 'font-medium' : ''}>
              Default
            </span>
            {scheme === 'default' && <span className="ml-auto text-muted-foreground">Aktif</span>}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setScheme('kpu')}
          >
            <span className={scheme === 'kpu' ? 'font-medium' : ''}>
              KPU
            </span>
            {scheme === 'kpu' && <span className="ml-auto text-muted-foreground">Aktif</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}