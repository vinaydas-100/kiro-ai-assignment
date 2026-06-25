'use client';
import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import Box from '@mui/material/Box';
import { useThemeStore } from '@/store/themeStore';
import ThemeToggle from './ThemeToggle';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  const theme = useMemo(
    () =>
      createTheme({
        typography: { fontFamily: 'var(--font-roboto)' },
        cssVariables: true,
        colorSchemes: { light: true, dark: true },
        defaultColorScheme: mode,
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ body: { backgroundColor: theme.palette.background.default, color: theme.palette.text.primary } }} />
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1300,
        }}
      >
        <ThemeToggle />
      </Box>
      {children}
    </ThemeProvider>
  );
}
