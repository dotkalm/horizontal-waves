export const theme = {
  colors: {
    dark: '#1a1a1a',
    light: '#f5f5f5',
    primary: '#3b82f6',
    secondary: '#8b5cf6',
  },
  typography: {
    body1: {
      fontSize: '16px',
      lineHeight: '1.5',
      fontWeight: 400,
    },
    h1: {
      fontSize: '48px',
      lineHeight: '1.2',
      fontWeight: 700,
    },
  },
};

export type Theme = typeof theme;
