import React, { useRef, useState, useCallback } from 'react';
import styles from './ProductForm.module.scss';

export interface FocusValue {
  x: number; // 0..1 — posição horizontal (object-position)
  y: number; // 0..1
  zoom: number; // 1..3
}

interface FocusEditorProps {
  imageUrl: string;
  value: FocusValue | null;
  onChange: (value: FocusValue) => void;
}

/**
 * Editor de enquadramento 4:5 — arrasta para posicionar, slider de zoom.
 * Salva apenas metadados {x,y,zoom} no banco (foto original preservada).
 */
export const FocusEditor: React.FC<FocusEditorProps> = ({ imageUrl, value, onChange }) => {
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ px: 0, py: 0, fx: 0.5, fy: 0.5 });
  const frameRef = useRef<HTMLDivElement>(null);
  const focus: FocusValue = value ?? { x: 0.5, y: 0.5, zoom: 1 };

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { px: e.clientX, py: e.clientY, fx: focus.x, fy: focus.y };
    setDragging(true);
  };

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      // fração do quadro arrastada; sensibilidade reduzida pelo zoom
      const dxFrac = (e.clientX - dragStart.current.px) / rect.width;
      const dyFrac = (e.clientY - dragStart.current.py) / rect.height;
      const k = 1.6 / focus.zoom; // arrastar p/ direita mostra conteúdo mais à esquerda
      onChange({
        ...focus,
        x: clamp(dragStart.current.fx - dxFrac * k, 0, 1),
        y: clamp(dragStart.current.fy - dyFrac * k, 0, 1),
      });
    },
    [dragging, focus, onChange]
  );

  const onPointerUp = () => setDragging(false);

  const imgStyle: React.CSSProperties = {
    objectPosition: `${focus.x * 100}% ${focus.y * 100}%`,
    transform: `scale(${focus.zoom})`,
  };

  return (
    <div className={styles.focusEditor}>
      <div
        ref={frameRef}
        className={`${styles.focusFrame} ${dragging ? styles.dragging : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="application"
        aria-label="Editor de enquadramento da foto"
      >
        <img src={imageUrl} alt="" draggable={false} style={imgStyle} />
        <span className={styles.focusGridH} aria-hidden="true" />
        <span className={styles.focusGridV} aria-hidden="true" />
      </div>

      <div className={styles.zoomRow}>
        <label htmlFor="focus-zoom">Zoom</label>
        <input
          id="focus-zoom"
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={focus.zoom}
          onChange={(e) => onChange({ ...focus, zoom: clamp(Number(e.target.value), 1, 3) })}
        />
        <button
          type="button"
          className={styles.resetBtn}
          onClick={() => onChange({ x: 0.5, y: 0.5, zoom: 1 })}
        >
          Centralizar
        </button>
      </div>
      <p className={styles.focusHint}>Arraste a foto para escolher qual parte aparece no catálogo.</p>
    </div>
  );
};
