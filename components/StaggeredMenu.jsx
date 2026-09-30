'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

export default function StaggeredMenu({
  position = 'right', colors = ['#f6e89a', '#ff923b'], items = [], socialItems = [],
  displaySocials = false, displayItemNumbering = true, className = '',
  menuButtonColor = '#292929', openMenuButtonColor = '#292929', accentColor = '#ef5d5b',
  changeMenuColorOnOpen = true, closeOnClickAway = true, onMenuOpen = undefined, onMenuClose = undefined
}) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const layersRef = useRef(null);
  const iconRef = useRef(null);
  const buttonRef = useRef(null);
  const timelineRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const layers = layersRef.current ? [...layersRef.current.querySelectorAll('.sm-prelayer')] : [];
    if (!root || !panel) return;
    const offset = position === 'left' ? -105 : 105;
    gsap.set([panel, ...layers], { xPercent: offset, autoAlpha: 0 });
    gsap.set(root.querySelectorAll('.sm-panel-itemLabel'), { yPercent: 130, rotate: 8 });
    return () => { timelineRef.current?.kill(); gsap.killTweensOf([panel, ...layers]); };
  }, [position]);

  const closeMenu = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    onMenuClose?.();
    timelineRef.current?.kill();
    const offset = position === 'left' ? -105 : 105;
    const layers = layersRef.current ? [...layersRef.current.querySelectorAll('.sm-prelayer')] : [];
    timelineRef.current = gsap.timeline({ onComplete: () => {
      if (panelRef.current) gsap.set([panelRef.current, ...layers], { autoAlpha: 0 });
    } });
    timelineRef.current.to([panelRef.current, ...layers], { xPercent: offset, duration: 0.34, ease: 'power3.in', stagger: 0.035 }, 0);
    gsap.to(iconRef.current, { rotate: 0, duration: 0.3, ease: 'power2.out', overwrite: true });
    if (changeMenuColorOnOpen) gsap.to(buttonRef.current, { color: menuButtonColor, duration: 0.25, overwrite: true });
  }, [changeMenuColorOnOpen, menuButtonColor, onMenuClose, position]);

  const openMenu = useCallback(() => {
    if (openRef.current) return;
    openRef.current = true;
    setOpen(true);
    onMenuOpen?.();
    timelineRef.current?.kill();
    const panel = panelRef.current;
    if (!panel) return;
    const layers = layersRef.current ? [...layersRef.current.querySelectorAll('.sm-prelayer')] : [];
    const offset = position === 'left' ? -105 : 105;
    gsap.set([panel, ...layers], { xPercent: offset, autoAlpha: 1 });
    const labels = [...panel.querySelectorAll('.sm-panel-itemLabel')];
    gsap.set(labels, { yPercent: 130, rotate: 8 });
    const tl = gsap.timeline();
    layers.forEach((layer, index) => tl.to(layer, { xPercent: 0, duration: 0.48, ease: 'power4.out' }, index * 0.065));
    const insert = layers.length * 0.065;
    tl.to(panel, { xPercent: 0, duration: 0.62, ease: 'power4.out' }, insert);
    tl.to(labels, { yPercent: 0, rotate: 0, duration: 0.72, ease: 'power4.out', stagger: 0.085 }, insert + 0.12);
    const numbers = [...panel.querySelectorAll('.sm-panel-item')];
    tl.to(numbers, { '--sm-num-opacity': 1, duration: 0.45, stagger: 0.06, ease: 'power2.out' }, insert + 0.2);
    timelineRef.current = tl;
    gsap.to(iconRef.current, { rotate: 225, duration: 0.55, ease: 'power3.out', overwrite: true });
    if (changeMenuColorOnOpen) gsap.to(buttonRef.current, { color: openMenuButtonColor, duration: 0.25, overwrite: true });
  }, [changeMenuColorOnOpen, onMenuOpen, openMenuButtonColor, position]);

  const toggleMenu = () => openRef.current ? closeMenu() : openMenu();
  useEffect(() => {
    if (!open) return;
    const onPointerDown = event => {
      if (closeOnClickAway && rootRef.current && !rootRef.current.contains(event.target)) closeMenu();
    };
    const onKeyDown = event => { if (event.key === 'Escape') closeMenu(); };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, closeOnClickAway, closeMenu]);

  const palette = colors.slice(0, 3);
  return <div ref={rootRef} className={`staggered-menu-wrapper fixed-wrapper ${className}`} style={{ '--sm-accent': accentColor }} data-position={position} data-open={open || undefined}>
    <div ref={layersRef} className="sm-prelayers" aria-hidden="true">{palette.map((color, index) => <div className="sm-prelayer" key={index} style={{ background: color }} />)}</div>
    <header className="staggered-menu-header" aria-label="Main navigation header">
      <button ref={buttonRef} className="sm-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="staggered-menu-panel" onClick={toggleMenu} type="button">
        <span className="sm-toggle-text">{open ? 'Close' : 'Menu'}</span>
        <span ref={iconRef} className="sm-icon" aria-hidden="true"><span className="sm-icon-line" /><span className="sm-icon-line sm-icon-line-v" /></span>
      </button>
    </header>
    <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
      <div className="sm-panel-inner">
        <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
          {items.map((item, index) => <li className="sm-panel-itemWrap" key={item.label + index}><a className="sm-panel-item" href={item.link} aria-label={item.ariaLabel || item.label} data-index={index + 1} tabIndex={open ? 0 : -1} onClick={closeMenu}><span className="sm-panel-itemLabel">{item.label}</span></a></li>)}
        </ul>
        {displaySocials && socialItems.length > 0 && <div className="sm-socials"><h3 className="sm-socials-title">Socials</h3><ul className="sm-socials-list" role="list">{socialItems.map((item, index) => <li key={item.label + index}><a className="sm-socials-link" href={item.link}>{item.label}</a></li>)}</ul></div>}
      </div>
    </aside>
  </div>;
}
