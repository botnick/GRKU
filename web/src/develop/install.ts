/**
 * The link from the Develop page to the install page: the look and the camera modules of a
 * development, which the install page puts on the card. The install page reads it at its start,
 * so this module stays small.
 */
import type { ModuleKey } from '../modules';
import { isOn, MODULE_NAMES, type DevelopSettings, type ModuleName } from './settings';

/** The modules of the camera that the settings use (ModuleKey of modules.ts). */
export function cameraModules(settings: DevelopSettings): ModuleKey[] {
  const keys: Record<ModuleName, ModuleKey> = { glow: 'glow', leak: 'lightLeak', diffusion: 'diffusion', grain: 'grain', date: 'dateStamp', border: 'border' };
  return [...(settings.look ? (['filmLook'] as ModuleKey[]) : []), ...MODULE_NAMES.filter((module) => isOn(settings, module)).map((module) => keys[module])];
}

/** The query of the install page that puts the look and the modules of `settings` on the card. */
export function installQuery(settings: DevelopSettings): string {
  const params = new URLSearchParams();
  if (settings.look) params.set('look', settings.look);
  const modules = cameraModules(settings);
  if (modules.length) params.set('modules', modules.join(','));
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** The look and the modules of an install address (installQuery), each checked. */
export function readInstallQuery(search: string, known: ReadonlySet<ModuleKey>): { look: string | null; modules: ModuleKey[] } {
  const params = new URLSearchParams(search);
  const look = params.get('look');
  const modules = (params.get('modules') ?? '')
    .split(',')
    .filter((key): key is ModuleKey => known.has(key as ModuleKey));
  return { look: look && /^[a-z0-9-]{1,64}$/.test(look) ? look : null, modules: [...new Set(modules)] };
}
