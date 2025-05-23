import { atom } from 'nanostores';

export const isMenuOpen = atom(false); // Default to closed

export function toggleMenu() {
  isMenuOpen.set(!isMenuOpen.get());
}

export function setMenuOpen(isOpen: boolean) {
  isMenuOpen.set(isOpen);
}
