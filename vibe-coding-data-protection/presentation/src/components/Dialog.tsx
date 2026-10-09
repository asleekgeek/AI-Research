import { useCallback, useEffect, useRef, useState } from 'react';

export interface DialogCtl {
  ref: { current: HTMLDialogElement | null };
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;
}

export function useDialog(): DialogCtl {
  const ref = useRef<HTMLDialogElement | null>(null);
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => {
    if (!ref.current?.open) ref.current?.showModal();
    setOpen(true);
  }, []);
  const close = useCallback(() => ref.current?.close(), []);
  return { ref, isOpen, open, close, setOpen };
}

let uid = 0;

/** Native modal dialog: Esc and backdrop clicks close it; content renders only while open. */
export function Dialog({ ctl, title, drawer, children }: { ctl: DialogCtl; title: string; drawer?: boolean; children: any }) {
  const id = useRef(`dlg-${++uid}`).current;
  useEffect(() => {
    const d = ctl.ref.current;
    if (!d) return;
    const onClose = () => ctl.setOpen(false);
    // Light dismiss for browsers without the closedby attribute.
    const onClick = (e: MouseEvent) => {
      if (e.target !== d || 'closedBy' in HTMLDialogElement.prototype) return;
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    };
    d.addEventListener('close', onClose);
    d.addEventListener('click', onClick);
    return () => {
      d.removeEventListener('close', onClose);
      d.removeEventListener('click', onClick);
    };
  }, []);
  return (
    <dialog ref={ctl.ref as any} class={`panel${drawer ? ' drawer' : ''}`} aria-labelledby={id} {...({ closedby: 'any' } as any)}>
      <div class="panel-head">
        <h2 id={id}>{title}</h2>
        <button type="button" class="closebtn" onClick={ctl.close}>
          Close
        </button>
      </div>
      <div class="panel-body">{ctl.isOpen ? children : null}</div>
    </dialog>
  );
}
