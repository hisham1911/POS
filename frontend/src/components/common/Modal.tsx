import type { ReactNode } from "react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitleText
} from "@/components/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  footer,
  size = "md",
  children
}: ModalProps) => (
  <Dialog open={isOpen} onClose={onClose}>
    <DialogContent onClose={onClose} size={size}>
      {title ? (
        <DialogHeader>
          <DialogTitleText>{title}</DialogTitleText>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
      ) : null}
      <DialogBody>{children}</DialogBody>
      {footer ? <DialogFooter>{footer}</DialogFooter> : null}
    </DialogContent>
  </Dialog>
);
