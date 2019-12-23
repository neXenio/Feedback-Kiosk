import React from "react";
import styled, { keyframes } from "styled-components";

const movingBackgroundAnimaion = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const StyledProgressBar = styled.div`
  height: 5px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  background: #D10C02;
  background-repeat: no-repeat;
  background-size: 200% 200%;
  animation-name: ${movingBackgroundAnimaion};
  animation-duration: 750ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  transition: transform 200ms linear, opacity 0ms;
`;

export function ProgressBar({ renderableProgress, show }) {
  return (
    <StyledProgressBar
      style={{
        transform: `translateX(${-100 +
            (typeof renderableProgress === "number" ? renderableProgress : 0) * 100}%)`,
        opacity: show ? 1 : 0
      }}
    />
  );
}