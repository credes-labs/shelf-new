'use client';

import { ClipboardEvent, KeyboardEvent, PointerEvent, useEffect, useRef, useState } from 'react';
import { Bold, ChevronDown, Italic } from 'lucide-react';

type FontName = 'Caveat' | 'Instrument Serif' | 'Space Grotesk' | 'JetBrains Mono' | 'Playfair Display' | 'Inter';
type IntroState = {
  fields: { name: string; city: string };
  styled: { text: string; font: FontName; bold: boolean; italic: boolean; color: string; size: number };
};
type MenuName = 'font' | 'color' | null;

const STORAGE_KEY = 'shelf-editable-intro-v1';
const INITIAL: IntroState = {
  fields: { name: 'context', city: 'it' },
  styled: { text: 'matters', font: 'Caveat', bold: false, italic: true, color: '#292929', size: 58 },
};
const FONTS: FontName[] = ['Caveat', 'Instrument Serif', 'Space Grotesk', 'JetBrains Mono', 'Playfair Display', 'Inter'];
const COLORS = ['#292929', '#777777', '#e94f5a', '#f28a32', '#32885b', '#3978d0', '#8056bb', '#df6b9a'];
const FONT_STACKS: Record<FontName, string> = {
  Caveat: 'var(--font-caveat), cursive',
  'Instrument Serif': 'var(--font-instrument-serif), Georgia, serif',
  'Space Grotesk': 'var(--font-space-grotesk), Arial, sans-serif',
  'JetBrains Mono': 'var(--font-jetbrains-mono), monospace',
  'Playfair Display': 'var(--font-playfair-display), Georgia, serif',
  Inter: 'Inter, Arial, sans-serif',
};

function cleanText(text: string) {
  return text.replace(/[\r\n\t]/g, ' ').slice(0, 30);
}

function EditableField({ value, label, onChange }: { value: string; label: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) ref.current.textContent = value;
    if (value.trim()) previous.current = value;
  }, [value]);
  function sync(element: HTMLSpanElement) {
    const next = cleanText(element.textContent ?? '');
    if (element.textContent !== next) element.textContent = next;
    onChange(next);
  }
  return <span
    ref={ref}
    className="intro-editable-field"
    role="textbox"
    aria-label={label}
    aria-multiline="false"
    contentEditable
    suppressContentEditableWarning
    spellCheck={false}
    onInput={(event) => sync(event.currentTarget)}
    onPaste={(event) => {
      event.preventDefault();
      const pasted = cleanText(event.clipboardData.getData('text/plain'));
      document.execCommand('insertText', false, pasted);
      if (ref.current) sync(ref.current);
    }}
    onKeyDown={(event) => {
      if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
      if (event.key.length === 1 && (event.currentTarget.textContent?.length ?? 0) >= 30 && !window.getSelection()?.toString()) event.preventDefault();
    }}
    onBlur={() => {
      const next = ref.current?.textContent?.trim() ?? '';
      const resolved = next || previous.current;
      if (ref.current) ref.current.textContent = resolved;
      onChange(resolved);
    }}
  />;
}

export default function EditableIntro() {
  const [intro, setIntro] = useState<IntroState>(INITIAL);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(false);
  const [menu, setMenu] = useState<MenuName>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ left: 0, top: 0 });
  const tokenRef = useRef<HTMLSpanElement>(null);
  const editorRef = useRef<HTMLSpanElement>(null);
  const styledTextRef = useRef(INITIAL.styled.text);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ pointerX: number; pointerY: number; size: number; corner: string } | null>(null);

  useEffect(() => {
    let restored: IntroState | null = null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as IntroState;
        if (parsed.fields && parsed.styled) restored = {
          fields: { name: cleanText(parsed.fields.name || INITIAL.fields.name), city: cleanText(parsed.fields.city || INITIAL.fields.city) },
          styled: {
            ...INITIAL.styled,
            ...parsed.styled,
            text: cleanText(parsed.styled.text || INITIAL.styled.text),
            font: FONTS.includes(parsed.styled.font) ? parsed.styled.font : INITIAL.styled.font,
            size: Math.max(14, Math.min(64, Number(parsed.styled.size) || INITIAL.styled.size)),
          },
        };
      }
    } catch { /* Local storage can be disabled or contain stale data. */ }
    const timer = window.setTimeout(() => {
      if (restored) {
        styledTextRef.current = restored.styled.text;
        setIntro(restored);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...intro, styled: { ...intro.styled, text: styledTextRef.current } })); } catch { /* Editing remains available without persistence. */ }
  }, [intro, ready]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.textContent !== intro.styled.text) editorRef.current.textContent = intro.styled.text;
  }, [intro.styled.text]);

  useEffect(() => {
    if (!selected) return;
    const updatePosition = () => {
      const token = tokenRef.current;
      const toolbar = toolbarRef.current;
      if (!token || !toolbar) return;
      const rect = token.getBoundingClientRect();
      const toolbarRect = toolbar.getBoundingClientRect();
      const margin = 12;
      const left = Math.min(window.innerWidth - toolbarRect.width - 12, Math.max(12, rect.left + rect.width / 2 - toolbarRect.width / 2));
      const below = rect.bottom + margin + toolbarRect.height <= window.innerHeight - 8;
      const top = below ? rect.bottom + margin : Math.max(8, rect.top - toolbarRect.height - margin);
      setToolbarPosition({ left, top });
    };
    const frame = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [selected, menu, intro.styled.font]);

  useEffect(() => {
    if (!selected) return;
    const handleOutside = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      if (!tokenRef.current?.contains(target) && !toolbarRef.current?.contains(target)) {
        setMenu(null);
        setSelected(false);
      }
    };
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (menu) setMenu(null);
      else { setSelected(false); editorRef.current?.blur(); }
    };
    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selected, menu]);

  function updateField(field: 'name' | 'city', value: string) {
    setIntro((current) => ({ ...current, fields: { ...current.fields, [field]: value } }));
  }
  function updateStyled(values: Partial<IntroState['styled']>) {
    setIntro((current) => ({ ...current, styled: { ...current.styled, ...values } }));
  }
  function updateStyledText() {
    const element = editorRef.current;
    if (!element) return;
    const next = cleanText(element.textContent ?? '');
    if (element.textContent !== next) element.textContent = next;
    styledTextRef.current = next;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...intro, styled: { ...intro.styled, text: next } })); } catch { /* Editing remains available without persistence. */ }
  }
  function pastePlain(event: ClipboardEvent<HTMLSpanElement>) {
    event.preventDefault();
    document.execCommand('insertText', false, cleanText(event.clipboardData.getData('text/plain')));
    updateStyledText();
  }
  function resizeToken(event: PointerEvent<HTMLButtonElement>) {
    const resize = resizeRef.current;
    if (!resize) return;
    const dx = event.clientX - resize.pointerX;
    const dy = event.clientY - resize.pointerY;
    const direction = resize.corner.includes('left') ? -1 : 1;
    updateStyled({ size: Math.round(Math.max(14, Math.min(64, resize.size + direction * (dx - dy) / 2))) });
  }
  function startResize(event: PointerEvent<HTMLButtonElement>) {
    const corner = event.currentTarget.dataset.corner ?? 'bottom-right';
    resizeRef.current = { pointerX: event.clientX, pointerY: event.clientY, size: intro.styled.size, corner };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function stopResize() { resizeRef.current = null; }
  function menuKeys(event: KeyboardEvent<HTMLDivElement>) {
    const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]'));
    if (event.key === 'Escape') { event.stopPropagation(); setMenu(null); return; }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const active = options.indexOf(document.activeElement as HTMLButtonElement);
    const offset = event.key === 'ArrowDown' ? 1 : -1;
    options[(active + offset + options.length) % options.length]?.focus();
  }
  function selectStyled() {
    setSelected(true);
    setMenu(null);
  }

  return <>
    <h1 className="editable-intro">
      <span className="intro-line">Keep your <EditableField value={intro.fields.name} label="First editable phrase" onChange={(value) => updateField('name', value)} />.</span>
      <span className="intro-line">Find <EditableField value={intro.fields.city} label="Second editable phrase" onChange={(value) => updateField('city', value)} /> when it{' '}
        <span ref={tokenRef} className={`styled-token-wrap${selected ? ' is-selected' : ''}`} onClick={selectStyled}>
          <span
            ref={editorRef}
            className="styled-token-editor"
            role="textbox"
            aria-label="Highlighted phrase, editable"
            aria-multiline="false"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            tabIndex={0}
            style={{ fontFamily: FONT_STACKS[intro.styled.font], fontWeight: intro.styled.bold ? 700 : 400, fontStyle: intro.styled.italic ? 'italic' : 'normal', color: intro.styled.color, fontSize: intro.styled.size }}
            onInput={updateStyledText}
            onPaste={pastePlain}
            onFocus={() => setSelected(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
              if (event.key.length === 1 && (event.currentTarget.textContent?.length ?? 0) >= 30 && !window.getSelection()?.toString()) event.preventDefault();
            }}
            onBlur={() => {
              const next = editorRef.current?.textContent?.trim() ?? '';
              const resolved = next || intro.styled.text || INITIAL.styled.text;
              if (editorRef.current) editorRef.current.textContent = resolved;
              updateStyled({ text: resolved });
            }}
          />
          {selected && <span className="token-selection-outline" aria-hidden="true" />}
          {selected && ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => <button
            key={corner}
            className={`token-handle token-handle-${corner}`}
            type="button"
            aria-label={`Resize highlighted phrase from ${corner.replace('-', ' ')}`}
            onMouseDown={(event) => event.preventDefault()}
            data-corner={corner}
            onPointerDown={startResize}
            onPointerMove={resizeToken}
            onPointerUp={stopResize}
            onPointerCancel={stopResize}
          />)}
        </span>!
      </span>
    </h1>
    {selected && <div
      ref={toolbarRef}
      className="token-toolbar"
      role="toolbar"
      aria-label="Highlighted phrase formatting"
      style={{ left: toolbarPosition.left, top: toolbarPosition.top }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="token-toolbar-control token-font-control">
        <button type="button" className="token-font-button" aria-haspopup="listbox" aria-expanded={menu === 'font'} onClick={() => setMenu(menu === 'font' ? null : 'font')} style={{ fontFamily: FONT_STACKS[intro.styled.font] }}>{intro.styled.font}<ChevronDown size={14} /></button>
        {menu === 'font' && <div className="token-popover token-font-popover" role="listbox" aria-label="Font family" onKeyDown={menuKeys}>{FONTS.map((font) => <button key={font} role="option" aria-selected={intro.styled.font === font} type="button" style={{ fontFamily: FONT_STACKS[font] }} onClick={() => { updateStyled({ font }); setMenu(null); }}>{font}</button>)}</div>}
      </div>
      <span className="token-toolbar-divider" />
      <button type="button" className={`token-toggle${intro.styled.bold ? ' active' : ''}`} aria-label="Bold" aria-pressed={intro.styled.bold} onClick={() => updateStyled({ bold: !intro.styled.bold })}><Bold size={18} /></button>
      <button type="button" className={`token-toggle${intro.styled.italic ? ' active' : ''}`} aria-label="Italic" aria-pressed={intro.styled.italic} onClick={() => updateStyled({ italic: !intro.styled.italic })}><Italic size={18} /></button>
      <span className="token-toolbar-divider" />
      <div className="token-toolbar-control token-color-control">
        <button type="button" className="token-color-button" aria-label="Text color" aria-haspopup="listbox" aria-expanded={menu === 'color'} onClick={() => setMenu(menu === 'color' ? null : 'color')}><span style={{ backgroundColor: intro.styled.color }} /><ChevronDown size={14} /></button>
        {menu === 'color' && <div className="token-popover token-color-popover" role="listbox" aria-label="Text color" onKeyDown={menuKeys}>{COLORS.map((color) => <button key={color} role="option" aria-label={`Color ${color}`} aria-selected={intro.styled.color === color} type="button" onClick={() => { updateStyled({ color }); setMenu(null); }}><span style={{ backgroundColor: color }} /></button>)}</div>}
      </div>
    </div>}
  </>;
}
















