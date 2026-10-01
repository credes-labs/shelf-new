'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HeadlineStyleToken.module.css';

const fonts = ['Georgia', 'Caveat', 'Instrument Serif', 'Space Grotesk', 'JetBrains Mono', 'Playfair Display', 'Inter'];
const colors = ['#ffffff', '#171717', '#777777', '#ff6a3a', '#ffb52e', '#57ce83', '#6cc4ff', '#b17aff', '#ff75ab'];
type Style = { font: string; bold: boolean; italic: boolean; color: string };
const initial: Style = { font: 'Georgia', bold: false, italic: true, color: '#ffffff' };

export default function HeadlineStyleToken() {
  const [style, setStyle] = useState<Style>(initial);
  const [selected, setSelected] = useState(false);
  const [menu, setMenu] = useState<'font' | 'color' | null>(null);
  const root = useRef<HTMLSpanElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shelf-matters-style');
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Style>;
        setStyle({ ...initial, ...parsed, font: fonts.includes(parsed.font ?? '') ? parsed.font! : initial.font, color: colors.includes(parsed.color ?? '') ? parsed.color! : initial.color });
      }
    } catch { /* Storage may be disabled. */ }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try { localStorage.setItem('shelf-matters-style', JSON.stringify(style)); } catch { /* Storage may be disabled. */ }
  }, [style]);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) { setSelected(false); setMenu(null); }
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  function keyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (menu) setMenu(null); else setSelected(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); setSelected(true);
    }
  }

  return <span ref={root} className={styles.root}>
    <span
      className={styles.word}
      role="button"
      tabIndex={0}
      aria-label="Style the word matters"
      aria-pressed={selected}
      onClick={() => { setSelected(value => !value); setMenu(null); }}
      onKeyDown={keyDown}
      style={{ fontFamily: style.font === 'Georgia' ? 'Georgia, serif' : `"${style.font}", ${style.font === 'Caveat' ? 'cursive' : 'sans-serif'}`, fontWeight: style.bold ? 700 : 400, fontStyle: style.italic ? 'italic' : 'normal', color: style.color }}
    >matters.</span>
    <span className={`${styles.selection} ${styles.visible}`} aria-hidden="true"><i /><i /><i /><i /></span>
    <div className={`${styles.toolbar} ${selected ? styles.toolbarVisible : ''}`} role="toolbar" aria-label="Style matters" onPointerDown={event => event.preventDefault()}>
      <div className={styles.controlWrap}>
        <button type="button" className={`${styles.fontButton} ${menu === 'font' ? styles.active : ''}`} aria-haspopup="listbox" aria-expanded={menu === 'font'} onClick={() => setMenu(menu === 'font' ? null : 'font')} style={{ fontFamily: style.font }}>{style.font}<span className={styles.chevron}>⌄</span></button>
        {menu === 'font' && <div className={`${styles.popover} ${styles.fontList}`} role="listbox" aria-label="Font family">
          {fonts.map(font => <button type="button" role="option" aria-selected={style.font === font} key={font} style={{ fontFamily: font === 'Georgia' ? 'Georgia,serif' : `"${font}", sans-serif` }} onClick={() => { setStyle(s => ({ ...s, font })); setMenu(null); }}>{font}</button>)}
        </div>}
      </div>
      <span className={styles.divider} />
      <button type="button" className={`${styles.toggle} ${style.bold ? styles.active : ''}`} aria-label="Bold" aria-pressed={style.bold} onClick={() => setStyle(s => ({ ...s, bold: !s.bold }))}>B</button>
      <button type="button" className={`${styles.toggle} ${style.italic ? styles.active : ''}`} aria-label="Italic" aria-pressed={style.italic} onClick={() => setStyle(s => ({ ...s, italic: !s.italic }))}><i>I</i></button>
      <span className={styles.divider} />
      <div className={styles.controlWrap}>
        <button type="button" className={`${styles.colorButton} ${menu === 'color' ? styles.active : ''}`} aria-label="Text color" aria-haspopup="listbox" aria-expanded={menu === 'color'} onClick={() => setMenu(menu === 'color' ? null : 'color')}><i style={{ background: style.color, borderColor: style.color === '#ffffff' ? '#bbb' : style.color }} /><span className={styles.chevron}>⌄</span></button>
        {menu === 'color' && <div className={`${styles.popover} ${styles.colorList}`} role="listbox" aria-label="Text color">
          {colors.map(color => <button type="button" role="option" aria-label={color} aria-selected={style.color === color} key={color} onClick={() => { setStyle(s => ({ ...s, color })); setMenu(null); }}><i style={{ background: color, borderColor: color === '#ffffff' ? '#bbb' : color }} /></button>)}
        </div>}
      </div>
    </div>
  </span>;
}
