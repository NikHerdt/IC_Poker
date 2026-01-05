import React from 'react';
import icLogo from '../../assets/img/ic_logo.png';
import styled from 'styled-components';

const LogoImage = styled.img`
  min-width: 120px;
  max-width: 180px;
  width: 20vmin;
  height: auto;
`;

const LogoWithText = () => (
  <LogoImage src={icLogo} alt="IC poker" />
);

export default LogoWithText;
