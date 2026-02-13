import 'solid-styled-components';
import { Theme } from '../theme';

declare module 'solid-styled-components' {
  export interface DefaultTheme extends Theme {}
}
