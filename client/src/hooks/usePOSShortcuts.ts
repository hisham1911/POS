import { useEffect } from "react";
import { useCart } from "./useCart";

interface UsePOSShortcutsProps {
    onCheckout: () => void;
    onSearch: () => void;
}

export const usePOSShortcuts = ({ onCheckout, onSearch }: UsePOSShortcutsProps) => {
    const { removeItem, items } = useCart();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12: Checkout
            if (e.key === "F12") {
                e.preventDefault();
                onCheckout();
            }

            // F2: Search
            if (e.key === "F2") {
                e.preventDefault();
                onSearch();
            }

            // Escape: Close modals (handled by modals themselves typically, but good for general focus resets)
            if (e.key === "Escape") {
                // Optional: blur active element if it's an input
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            }

            // Delete: Remove last item or selected item (simplified to last added for now if no selection logic exists)
            // Note: In a real app we'd need a "selected item" state in the cart.
            // For now, let's just log or skip as we don't have item selection state in the provided Cart component yet.
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onCheckout, onSearch]);
};
