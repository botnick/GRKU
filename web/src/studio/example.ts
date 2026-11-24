/**
 * A small example of what GRKU Studio makes, for the shutdown section beside its button: a
 * seasonal picture of the Studio, drawn on a canvas once its fonts have loaded. Loaded on its own,
 * without the rest of the Studio.
 */
import { resetContext } from '../shutdownDesigns';
import { renderDoc } from './render';
import { prepareFonts } from './fonts';
import { findTemplate } from './templates';
import { STUDIO_WIDTH, type TextLayer } from './model';

/** Draws the example `id` (a template) on `canvas`, scaled to the width of the canvas. */
export async function drawExample(canvas: HTMLCanvasElement, id: string): Promise<void> {
  const template = findTemplate(id);
  if (!template) return;
  const doc = template.build();
  await prepareFonts(doc.layers.filter((layer): layer is TextLayer => layer.type === 'text'));
  const context = canvas.getContext('2d');
  if (!context) return;
  const scale = canvas.width / STUDIO_WIDTH;
  resetContext(context);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  renderDoc(context, doc, { photo: null });
}
