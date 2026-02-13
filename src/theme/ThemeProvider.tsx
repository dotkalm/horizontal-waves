import { ParentComponent } from 'solid-js';
import { ThemeProvider as StyledThemeProvider } from 'solid-styled-components';
import { theme } from './theme';

export const ThemeProvider: ParentComponent = (props) => {
  return (
    <StyledThemeProvider theme={theme}>
      {props.children}
    </StyledThemeProvider>
  );
};
