import { ReactNode, useMemo, isValidElement, Children, cloneElement, ReactElement } from 'react';
import { TermTip } from '@/components/TermTip';
import { buildAliasIndex, glossary } from '@/data/glossary';

/**
 * Auto-wraps glossary terms (and their aliases) inside long prose with <TermTip />.
 *
 * Rules:
 * - Skipped tags: h1, h2, h3, code, pre, .katex, .formula-box (KaTeX), <a>, existing <TermTip>
 * - Each term is wrapped at most once per AutoTermify instance (avoids visual noise).
 * - Regex is built once via useMemo; aliases are escaped.
 *
 * Usage:
 *   <AutoTermify>
 *     <p>p-value показывает...</p>
 *     <p>SD — стандартное отклонение.</p>
 *   </AutoTermify>
 */

const SKIP_TAGS = new Set(['h1', 'h2', 'h3', 'code', 'pre', 'a']);
const SKIP_CLASS_RE = /(katex|formula-box|kicker|font-mono)/;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface AutoTermifyProps {
  children: ReactNode;
  /** Maximum number of times any single term is auto-wrapped. Default 1. */
  maxPerTerm?: number;
}

export const AutoTermify = ({ children, maxPerTerm = 1 }: AutoTermifyProps) => {
  const { regex, aliasMap } = useMemo(() => {
    const aliasMap = buildAliasIndex();
    // Sort by length DESC so longer aliases match first ("p-value" before "p")
    const aliases = Array.from(aliasMap.keys())
      .filter((a) => a.length >= 2)
      .sort((a, b) => b.length - a.length);

    if (aliases.length === 0) {
      return { regex: null, aliasMap };
    }

    // Word-boundary on Latin/Cyrillic. Use lookarounds to avoid matching inside other words.
    const pattern = `(?<![\\p{L}\\p{N}_])(${aliases.map(escapeRegex).join('|')})(?![\\p{L}\\p{N}_])`;
    return { regex: new RegExp(pattern, 'giu'), aliasMap };
  }, []);

  // Track wrap counts across the entire subtree to keep the prose readable.
  const counts = new Map<string, number>();

  const wrapText = (text: string): ReactNode[] => {
    if (!regex) return [text];
    regex.lastIndex = 0;
    const out: ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matched = match[0];
      const key = matched.toLowerCase();
      const entry = aliasMap.get(key);
      if (!entry) continue;

      const used = counts.get(entry.id) ?? 0;
      if (used >= maxPerTerm) continue;

      const start = match.index;
      if (start > lastIdx) out.push(text.slice(lastIdx, start));
      out.push(
        <TermTip key={`${entry.id}-${start}`} id={entry.id} plain>
          {matched}
        </TermTip>,
      );
      counts.set(entry.id, used + 1);
      lastIdx = start + matched.length;
    }

    if (lastIdx < text.length) out.push(text.slice(lastIdx));
    return out.length > 0 ? out : [text];
  };

  const shouldSkipElement = (el: ReactElement): boolean => {
    const type = el.type;
    if (typeof type === 'string' && SKIP_TAGS.has(type)) return true;
    // Skip already-wrapped TermTips
    if (typeof type === 'function' && (type as { displayName?: string; name?: string }).name === 'TermTip') return true;
    const className = (el.props as { className?: string })?.className;
    if (className && SKIP_CLASS_RE.test(className)) return true;
    return false;
  };

  const transform = (node: ReactNode): ReactNode => {
    if (node === null || node === undefined || typeof node === 'boolean') return node;
    if (typeof node === 'string') {
      const parts = wrapText(node);
      return parts.length === 1 ? parts[0] : parts;
    }
    if (typeof node === 'number') return node;
    if (Array.isArray(node)) return node.map((n, i) => <span key={i}>{transform(n)}</span>);

    if (isValidElement(node)) {
      if (shouldSkipElement(node)) return node;

      const children = (node.props as { children?: ReactNode }).children;
      if (children === undefined) return node;

      const newChildren = Children.map(children, (child) => transform(child));
      return cloneElement(node, undefined, newChildren);
    }

    return node;
  };

  return <>{transform(children)}</>;
};

/** Quick-access debug helper (used by tests / dev tools). */
export const __knownTerms = glossary.map((e) => e.id);
