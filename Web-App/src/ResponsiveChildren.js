// @flow

import React, { Children } from "react";
import styled, { css } from "styled-components";
import range from "lodash/range";

import { useElementSize } from "./useElementSize";

const MAX_ITEM_PER_ROW = 3;

const StyledRoot = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: -${({ itemPadding }) => itemPadding}px;
  margin-left: -${({ itemPadding }) => itemPadding}px;

  /*
    This is a self-referencing sibling selector
    This is basically a combination of
    - component reference as described here
      https://www.styled-components.com/docs/faqs#can-i-refer-to-other-components
    - wrapped in an interpolated function to allow the component to access itself via the now bound
      const StyledRoot
  */
  ${() => css`
    & + ${StyledRoot} {
      margin-top: ${({ itemPadding }) => itemPadding}px;
    }
  `};
`;

const StyledChild = styled.div`
  display: flex;
  min-width: ${({ minChildWidth }) => minChildWidth}px;

  /* To enforce the MIN_CHILD_WIDTH when setting flex-basis below, shrinking must be forbidden */
  flex-shrink: 0;
  flex-grow: 0;

  /* flex-grow is set as inline-style because it's very dynamic
     flex-basis is calculated responsively below */

  ${({ minChildWidth, elementWidth }) =>
    // eslint-disable-next-line
    range(1, MAX_ITEM_PER_ROW + 1).map(itemsPerRow => {
      const minElementSizeForRange = itemsPerRow * minChildWidth;

      if (elementWidth >= minElementSizeForRange) {
        return css`
          flex-basis: ${100 / itemsPerRow}%;
          /*
          We want those items that all fit in a single row to fill the whole width
            => flex-grow: 1
          If the items need multiple rows, the dangling items in the last row should instead have
          the same width as the other items (last row does not fill up remaining space at its end)
            => flex-grow: 0
          */
          &:nth-last-child(-n + ${({ numberOfChildren }) => numberOfChildren % itemsPerRow}) {
            flex-grow: ${({ numberOfChildren }) => (numberOfChildren > itemsPerRow ? 0 : 1)};
          }
        `;
      }
    })};
`;

// Yep, a separate DOM-layer just to apply padding
// Why? Well... https://github.com/philipwalton/flexbugs#flexbug-7
const StyledChildPadding = styled.div`
  display: flex;
  width: 100%;
  padding-top: ${({ itemPadding }) => itemPadding}px;
  padding-left: ${({ itemPadding }) => itemPadding}px;
`;

export function ResponsiveChildren({
  children,
  className,
  itemPadding = 12,
  minChildWidth = 300
}) {
  const { elementRef, elementWidth } = useElementSize();
  const numberOfChildren = Children.count(children);

  return (
    <StyledRoot ref={elementRef} itemPadding={itemPadding} className={className}>
      {Children.map(children, child => (
        <StyledChild
          numberOfChildren={numberOfChildren}
          minChildWidth={minChildWidth}
          itemPadding={itemPadding}
          elementWidth={elementWidth}
        >
          <StyledChildPadding itemPadding={itemPadding}>{child}</StyledChildPadding>
        </StyledChild>
      ))}
    </StyledRoot>
  );
}
