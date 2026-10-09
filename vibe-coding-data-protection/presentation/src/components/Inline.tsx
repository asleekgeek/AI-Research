import type { Inline as Node } from '../lib/types';
import { Chip } from './Chip';

/** Renders parsed paper Markdown (inline level). Links open the cited source in a new tab. */
export function Inline({ nodes }: { nodes: Node[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.t) {
          case 'text':
            return n.v;
          case 'code':
            return <code key={i}>{n.v}</code>;
          case 'tag':
            return <Chip key={i} code={n.v} />;
          case 'b':
            return (
              <strong key={i}>
                <Inline nodes={n.c} />
              </strong>
            );
          case 'i':
            return (
              <em key={i}>
                <Inline nodes={n.c} />
              </em>
            );
          case 'a':
            return (
              <a key={i} href={n.href} target="_blank" rel="noopener noreferrer">
                <Inline nodes={n.c} />
              </a>
            );
        }
      })}
    </>
  );
}

export function plain(nodes: Node[]): string {
  return nodes
    .map((n) => (n.t === 'text' || n.t === 'code' ? n.v : n.t === 'tag' ? `[${n.v}]` : plain(n.c)))
    .join('');
}
