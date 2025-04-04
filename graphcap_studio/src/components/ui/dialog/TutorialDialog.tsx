// SPDX-License-Identifier: Apache-2.0
import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
} from "@chakra-ui/react";
import { useEffect, useRef, ReactNode } from "react";

interface TutorialDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly maxWidth?: string;
  readonly children: ReactNode;
  readonly footerContent?: ReactNode;
}

export function TutorialDialog({
  isOpen,
  onClose,
  title,
  maxWidth = "800px",
  children,
  footerContent,
}: TutorialDialogProps) {
  const dialogContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleDialogClick(e: MouseEvent) {
      e.stopPropagation();
    }

    const dialogElement = dialogContentRef.current;
    if (dialogElement) {
      dialogElement.addEventListener("click", handleDialogClick);
      return () => {
        dialogElement.removeEventListener("click", handleDialogClick);
      };
    }
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            maxW={maxWidth}
            ref={dialogContentRef}
            maxH="90vh"
          >
            <Dialog.Header>
              <Dialog.Title>
                {title}
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Close" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body
              overflowY="auto"
              maxH="calc(90vh - 160px)"
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(0,0,0,0.3)',
                },
              }}
            >
              {children}
            </Dialog.Body>

            <Dialog.Footer>
              {footerContent ? (
                footerContent
              ) : (
                <Button colorScheme="blue" onClick={onClose}>
                  Close
                </Button>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
} 