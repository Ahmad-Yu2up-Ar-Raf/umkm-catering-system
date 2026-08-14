import { create } from "zustand"

/** Payload contract — anything that can be shown fullscreen. */
export interface ImageModalItem {
  src: string
  title?: string
  caption?: string
  category?: string
}

interface ImageModalState {
  isOpen: boolean
  items: ImageModalItem[]
  index: number
  /** Open a gallery scope; 2nd arg = start index. */
  open: (items: ImageModalItem[], index?: number) => void
  /** Open a single image. */
  openSingle: (item: ImageModalItem) => void
  close: () => void
  next: () => void
  prev: () => void
  setIndex: (index: number) => void
}

/**
 * Global image lightbox store (architectural blueprint §4.2).
 *
 * Zustand over Context: any component calls
 * `useImageModalStore.getState().open([...])` with zero prop drilling, and
 * only subscribed selectors re-render. The modal itself is mounted ONCE in
 * App.tsx. `next`/`prev` wrap around `items` and are no-ops for single items
 * or a closed modal.
 */
export const useImageModalStore = create<ImageModalState>((set, get) => ({
  isOpen: false,
  items: [],
  index: 0,
  open: (items, index = 0) => set({ isOpen: true, items, index }),
  openSingle: (item) => set({ isOpen: true, items: [item], index: 0 }),
  close: () => set({ isOpen: false }),
  next: () => {
    const { isOpen, items, index } = get()
    if (!isOpen || items.length < 2) return
    set({ index: (index + 1) % items.length })
  },
  prev: () => {
    const { isOpen, items, index } = get()
    if (!isOpen || items.length < 2) return
    set({ index: (index - 1 + items.length) % items.length })
  },
  setIndex: (index) => set({ index }),
}))
