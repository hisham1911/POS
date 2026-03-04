import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
}

/**
 * Portal component - renders children at document.body level
 * to escape any parent stacking contexts (z-index, overflow, etc.)
 * Used by all modals/overlays to ensure they appear above everything.
 */
export const Portal = ({ children }: PortalProps) => {
  return createPortal(children, document.body);
};
