'use client';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeStore();
  return (
    <IconButton onClick={toggleMode} aria-label="toggle dark mode" color="inherit">
      {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
}
