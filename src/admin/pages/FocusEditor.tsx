import React, { useRef, useState, useEffect } from 'react';
import styles from './ProductForm.module.scss';

export interface FocusValue {
  x: number; // 0..1 — object-position horizontal
  y: number; // 0..1 — object-position vertical
  zoom: number; // 0.5..3
  fitMode?: 'cover' | 'contain'; // modo de preenchimento
}

interface FocusEditorProps {
  imageUrl: string;
  value: FocusValue | null;
  onChange: (value: FocusValue) => void;
  aspectRatio?: string; // "4/5" | "1/1" | "16/9"
  fitMode?: 'cover' | 'contain';
  onFitModeChange?: (mode: 'cover' | 'contain') => void;
}

/**
 * Editor de enquadramento — reescrito do zero.
 * Drag simples: mouse down -> move -> up.
 * Sem stale closure: usa useRef para estado atual.
 * Math transparente: dx/dy em fração do frame -> object-position.
 */
export const FocusEditor: React.FC<FocusEditorProps> = ({
  imageUrl,
  value,
  onChange,
  aspectRatio = '4/5',
  fitMode = 'contain',
  onFitModeChange,
}) => {
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // Ref sempre atual - evita stale closure sem useEffect
  const focusRef = useRef<FocusValue>(value ?? { x: 0.5, y: 0.5, zoom: 1 });
  useEffect(() => {
    if (value) focusRef.current = value;
  }, [value]);

  // Estado local para UI (reage ao focusRef via setter)
  const [focus, setFocus] = useState<FocusValue>(focusRef.current);

  // Sincroniza focus local com ref quando prop muda
  useEffect(() => {
    setFocus(focusRef.current);
  }, [value]);

  const [arW, arH] = aspectRatio.split('/').map(Number);
  const aspect = arW / arH; // 4/5 = 0.8, 1/1 = 1

  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  // Inicia drag - captura ponteiro no frame
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); // bloqueia drag nativo do browser na img
    const frame = frameRef.current;
    if (!frame) return;

    frame.setPointerCapture(e.pointerId);
    setDragging(true);

    // Posição inicial do ponteiro + focus atual
    const start = {
      px: e.clientX,
      py: e.clientY,
      fx: focusRef.current.x,
      fy: focusRef.current.y,
    };

    // Guarda no dataset do frame para o move ler
    frame.dataset.dragStart = JSON.stringify(start);
  };

  // Move - lê do dataset, calcula, aplica
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const frame = frameRef.current;
    if (!frame) return;

    const startData = frame.dataset.dragStart;
    if (!startData) return;
    const start = JSON.parse(startData) as {
      px: number; py: number; fx: number; fy: number;
    };

    const rect = frame.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Fração do frame arrastada (0..1)
    const dxFrac = (e.clientX - start.px) / rect.width;
    const dyFrac = (e.clientY - start.py) / rect.height;

    // Sensibilidade base (mesma p/ ambos eixos) + compensação aspect-ratio
    const BASE_SENSITIVITY = 1.6;
    const kX = BASE_SENSITIVITY / focusRef.current.zoom;
    const kY = kX / aspect; // compensa altura > largura no 4/5

    // Nova posição: arrastar direita -> mostra esquerda (x diminui)
    // arrastar baixo -> mostra baixo (y aumenta)
    const nextX = clamp(start.fx - dxFrac * kX);
    const nextY = clamp(start.fy + dyFrac * kY);

    const next = { ...focusRef.current, x: nextX, y: nextY };
    focusRef.current = next;
    setFocus(next);
    onChange(next);
  };

  // Fim drag - libera capture
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (frame) {
      try { frame.releasePointerCapture(e.pointerId); } catch {}
      delete frame.dataset.dragStart;
    }
    setDragging(false);
  };

  const onZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextZoom = Math.max(0.5, Math.min(3, Number(e.target.value)));
    const next = { ...focusRef.current, zoom: nextZoom };
    focusRef.current = next;
    setFocus(next);
    onChange(next);
  };

  const onReset = () => {
    const next = { x: 0.5, y: 0.5, zoom: 1 };
    focusRef.current = next;
    setFocus(next);
    onChange(next);
  };

  const imgStyle: React.CSSProperties = {
    objectPosition: `${focus.x * 100}% ${focus.y * 100}%`,
    transform: `scale(${focus.zoom})`,
    objectFit: focus.zoom < 1 ? 'contain' : (fitMode ?? 'contain'),
  };

  return (
    <div className={styles.focusEditor}>
      <div
        ref={frameRef}
        style={{ aspectRatio }}
        className={`${styles.focusFrame} ${dragging ? styles.dragging : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        role="application"
        aria-label="Editor de enquadramento da foto"
      >
        <img
        src={imageUrl}
        alt=""
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        style={imgStyle}
      />
        <span className={styles.focusGridH} aria-hidden="true" />
        <span className={styles.focusGridV} aria-hidden="true" />
      </div>

      <div className={styles.zoomRow}>
        <label htmlFor="focus-zoom">Zoom</label>
        <input
          id="focus-zoom"
          type="range"
          min={0.5}
          max={3}
          step={0.05}
          value={focus.zoom}
          onChange={onZoomChange}
        />
        <button type="button" className={styles.resetBtn} onClick={onReset}>
          Centralizar
        </button>
        {onFitModeChange && (
          <label className={styles.fitModeToggle}>
            <input
              type="checkbox"
              checked={fitMode === 'cover'}
              onChange={(e) => onFitModeChange(e.target.checked ? 'cover' : 'contain')}
            />
            <span>Cobrir frame (corta bordas)</span>
          </label>
        )}
      </div>
      <p className={styles.focusHint}>
        Arraste a foto para escolher qual parte aparece no catálogo.
      </p>
    </div>
  );
};