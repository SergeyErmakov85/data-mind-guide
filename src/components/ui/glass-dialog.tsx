import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Dialog, DialogPortal, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Detect backdrop-filter support once on the client
const supportsBackdropFilter = (): boolean => {
  if (typeof window === 'undefined' || !window.CSS?.supports) return false;
  return (
    window.CSS.supports('backdrop-filter', 'blur(1px)') ||
    window.CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
  );
};

const GlassOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
GlassOverlay.displayName = 'GlassOverlay';

interface GlassDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Mono prefix shown in header, e.g. "DIALOG_ID" → "// DIALOG_ID" */
  dialogId?: string;
  /** Optional content rendered in the header, after the prefix */
  headerExtra?: React.ReactNode;
  /** Hide built-in header bar entirely */
  hideHeader?: boolean;
  /** Hide built-in close button (when supplying custom header) */
  hideClose?: boolean;
  /** Outer wrapper className overrides for the panel */
  panelClassName?: string;
}

const GlassDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  GlassDialogContentProps
>(
  (
    {
      className,
      panelClassName,
      children,
      dialogId,
      headerExtra,
      hideHeader,
      hideClose,
      ...props
    },
    ref,
  ) => {
    const [hasBackdrop, setHasBackdrop] = React.useState(true);
    React.useEffect(() => {
      setHasBackdrop(supportsBackdropFilter());
    }, []);

    // Light + dark backgrounds, with fallback when backdrop-filter is unsupported.
    const lightBg = hasBackdrop ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.92)';
    const darkBg = hasBackdrop ? 'rgba(15, 23, 42, 0.55)' : 'rgba(15, 23, 42, 0.96)';
    const blurStyle = hasBackdrop
      ? { backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)' }
      : {};

    return (
      <DialogPortal>
        <GlassOverlay />
        <DialogPrimitive.Content
          ref={ref}
          // Disable the radix entry/exit animation classes — framer-motion handles it.
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
            'focus:outline-none',
            className,
          )}
          {...props}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'glass-dialog-panel relative grid gap-4 p-6 text-foreground',
              panelClassName,
            )}
            style={{
              background: `var(--glass-bg, ${lightBg})`,
              border: '3px solid hsl(var(--foreground))',
              borderRadius: 0,
              boxShadow: '8px 8px 0 0 hsl(var(--foreground))',
              ...blurStyle,
            }}
          >
            {/* Inline style switch for dark mode background — uses CSS var fallback */}
            <style>{`
              .dark .glass-dialog-panel { background: ${darkBg} !important; }
            `}</style>

            {!hideHeader && (
              <div className="flex items-start justify-between gap-3 -mt-1 -mb-1">
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground shrink-0">
                    // {dialogId ?? 'DIALOG'}
                  </span>
                  {headerExtra}
                </div>
                {!hideClose && (
                  <DialogPrimitive.Close
                    aria-label="Закрыть"
                    className={cn(
                      'shrink-0 inline-flex items-center justify-center',
                      'w-9 h-9 border-3 border-foreground bg-background text-foreground',
                      'rounded-none transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    )}
                  >
                    <X className="w-4 h-4" />
                  </DialogPrimitive.Close>
                )}
              </div>
            )}

            {children}
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
GlassDialogContent.displayName = 'GlassDialogContent';

const GlassDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'font-heading uppercase tracking-tight text-2xl md:text-3xl font-bold leading-tight',
      className,
    )}
    {...props}
  />
));
GlassDialogTitle.displayName = 'GlassDialogTitle';

const GlassDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('font-body text-sm text-muted-foreground', className)}
    {...props}
  />
));
GlassDialogDescription.displayName = 'GlassDialogDescription';

const GlassDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2',
      className,
    )}
    {...props}
  />
);

// Wrap Root so consumers can also use AnimatePresence on open/close if they want.
const GlassDialog = ({
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) => (
  <Dialog {...props}>
    <AnimatePresence>{children}</AnimatePresence>
  </Dialog>
);

export {
  GlassDialog,
  GlassDialogContent,
  GlassDialogTitle,
  GlassDialogDescription,
  GlassDialogFooter,
  DialogTrigger as GlassDialogTrigger,
  DialogClose as GlassDialogClose,
};
