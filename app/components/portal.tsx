import { createPortal } from "react-dom";
import { useState, useEffect } from "react";

interface props {
  children: React.ReactNode;
  wrapperId: string;
}

/**
 * This component is used to render a component outside of the current DOM tree. 
 * @param wrapperId - The id of the element that will be used as the portal's container
 * @returns A div with the id of wrapperId  
 */
const createWrapper = (wrapperId: string) => {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("id", wrapperId);
  document.body.appendChild(wrapper);
  return wrapper;
};

export const Portal: React.FC<props> = ({ children, wrapperId }) => {
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create the wrapper if it doesn't exist
    let element = document.getElementById(wrapperId);
    let created = false;
    if (!element) {
      created = true;
      element = createWrapper(wrapperId);
    }

    setWrapper(element);

    // When the component unmounts, remove the wrapper if it was created by this component
    return () => {
      if (created && element?.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [wrapperId]);

  if (!wrapper) {
    return null;
  }

  // Create a portal that renders the children into the wrapper
  return createPortal(children, wrapper);
};
