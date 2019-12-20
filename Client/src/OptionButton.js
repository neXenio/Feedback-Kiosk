import React from 'react';
import styled from "styled-components";

const StyledRoot = styled.div`
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background-color: #A396FF;
  color: white;
  
  font-size: 26px;
  font-weight: 600;
`;

export function OptionButton({option, selectOption}) {
  return (
    <StyledRoot onClick={() => selectOption(option)}>
      {option.name}
    </StyledRoot>
  );
}