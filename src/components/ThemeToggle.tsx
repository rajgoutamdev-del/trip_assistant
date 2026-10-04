import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/store/ThemeProvider';
import { IconButton } from '@/components/ui/Button';

export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  return (
    <IconButton label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle}>
      {resolved === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </IconButton>
  );
}
