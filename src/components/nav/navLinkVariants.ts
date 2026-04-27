import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Centralised nav-link styles shared by Header desktop links, mobile sheet
 * links and dropdown menu items. Eliminates the duplicated cn(...) blocks
 * that previously lived in Header.tsx.
 */
export const navLinkVariants = cva(
  'flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        /** Top-level desktop nav item. */
        desktop: 'nav-link text-sm px-4 py-2 rounded-lg',
        /** Item inside a mobile sheet drawer (44px touch target). */
        mobile: 'gap-3 px-2 rounded-md min-h-11',
        /** Item inside a desktop dropdown card (Lab / Course menus). */
        dropdown:
          'block select-none space-y-1 rounded-md p-3 leading-none no-underline hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
      },
      active: {
        true: '',
        false: '',
      },
      tone: {
        primary: '',
        muted: '',
      },
    },
    compoundVariants: [
      // desktop active = solid primary pill
      {
        variant: 'desktop',
        active: true,
        class: 'bg-primary text-primary-foreground',
      },
      {
        variant: 'desktop',
        active: false,
        tone: 'muted',
        class: 'text-muted-foreground hover:text-foreground',
      },
      // mobile active = soft tint
      {
        variant: 'mobile',
        active: true,
        class: 'text-primary font-medium bg-primary/5',
      },
      {
        variant: 'mobile',
        active: false,
        class: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
      },
      // dropdown active = subtle accent
      { variant: 'dropdown', active: true, class: 'bg-accent' },
    ],
    defaultVariants: {
      variant: 'desktop',
      active: false,
      tone: 'muted',
    },
  },
);

export type NavLinkVariantProps = VariantProps<typeof navLinkVariants>;
