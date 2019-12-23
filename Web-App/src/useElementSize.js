// @flow

import { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";

export function useElementSize() {
  const elementRef = useRef(null);

  // Complex states (i.e. {..}) are not that well-supported yet (e.g. they are not yet inspectable
  // in the React Dev Tools) -> use separate primitive states for width & height
  const [elementWidth, setElementWidth] = useState(0);
  const [elementHeight, setElementHeight] = useState(0);

  // This should be called whenever the element size MIGHT have changed to update width/height and
  // return different values to the using component
  const updateElementSize = useCallback(() => {
    // Initially, we probably don't have a ref, yet.
    if (!elementRef.current) {
      return;
    }
    const { offsetWidth, offsetHeight } = elementRef.current;

    // Only update width and height if its value differs to avoid useless recomputations in the
    // using component due to our state update
    offsetWidth !== elementWidth && setElementWidth(elementRef.current.offsetWidth);
    offsetHeight !== elementHeight && setElementHeight(elementRef.current.offsetHeight);
  }, [elementHeight, elementWidth]);

  const currentOffsetWidth = elementRef.current?.offsetWidth;
  const currentOffsetHeight = elementRef.current?.offsetHeight;

  // Update element size whenever the window resizes
  useEffect(() => {
    function onWindowResize() {
      updateElementSize();
    }
    window.addEventListener("resize", onWindowResize);
    return () => window.removeEventListener("resize", onWindowResize);
  }, [updateElementSize]);

  // Update element size whenever one of the custom `sizeDependencies` changes
  // This is to allow for maintaining the element width even in more complex scenarios where the
  // dimensions of the element dynamically change based on some data (e.g. number of items in a
  // list)
  useLayoutEffect(updateElementSize, [
    currentOffsetWidth,
    currentOffsetHeight
  ]);

  return {
    elementRef,
    elementWidth,
    elementHeight,
    refreshHeight: updateElementSize
  };
}
