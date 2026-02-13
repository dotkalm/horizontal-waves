import { styled } from 'solid-styled-components';

const StyledSvg = styled.svg`
  max-width: 800px;
  width: 100%;
  background: ${props => props.theme!.colors.light};
  border: 2px solid ${props => props.theme!.colors.primary};
  
  @media (max-width: 768px) {
    max-width: 400px;
  }
`;

export default function Viewbox() {
  return <StyledSvg />;
};