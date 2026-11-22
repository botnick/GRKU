import { describe, expect, it, vi } from 'vitest';
import { anchorPage, pageLink } from './navigation';

describe('anchorPage', () => {
  it('sends the anchors of the one-page site to their pages', () => {
    expect(anchorPage('#install')).toBe('install');
    expect(anchorPage('#modules')).toBe('install');
    expect(anchorPage('#camera')).toBe('install');
    expect(anchorPage('#looks')).toBe('looks');
    expect(anchorPage('#plus=abc')).toBe('looks');
    expect(anchorPage('#pay=abcdefghij')).toBe('looks');
    expect(anchorPage('#faq')).toBeNull();
    expect(anchorPage('')).toBeNull();
  });
});

describe('pageLink', () => {
  const click = (fields: Record<string, unknown> = {}) => ({
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    preventDefault: vi.fn(),
    ...fields,
  });

  it('links to the page of the language and follows a plain click in place', () => {
    const navigate = vi.fn();
    const link = pageLink('en', navigate, 'install', '#zip');
    expect(link.href).toBe('/en/install/#zip');
    const event = click();
    link.onClick(event as never);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('install', '#zip');
    expect(pageLink('th', navigate, 'looks').href).toBe('/looks/');
  });

  it('leaves a click for a new tab to the browser', () => {
    const navigate = vi.fn();
    pageLink('ja', navigate, 'home').onClick(click({ metaKey: true }) as never);
    pageLink('ja', navigate, 'home').onClick(click({ button: 1 }) as never);
    expect(navigate).not.toHaveBeenCalled();
  });
});
