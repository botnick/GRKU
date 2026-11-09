import { siteUrl } from '../catalog';
import { recipeLook } from '../recipeLook';
import type { Recipe } from '../recipes';

/**
 * A sample photo with a rough rendering of a recipe (`recipeLook`): the photo under a CSS filter, a
 * color cast in soft light, and the grain as a noise overlay. 3:2, as the photo.
 */
export function RecipePhoto({ recipe, src, className = '' }: { recipe: Recipe; src: string; className?: string }) {
  const look = recipeLook(recipe);
  return (
    <span className={`relative block aspect-[3/2] overflow-hidden bg-black ${className}`} aria-hidden="true">
      <img src={src} alt="" width="360" height="240" loading="lazy" className="size-full object-cover" style={{ filter: look.filter }} />
      {look.cast && <span className="absolute inset-0" style={{ background: look.cast, mixBlendMode: 'soft-light' }} />}
      {look.grain > 0 && <span className="absolute inset-0 bg-repeat" style={{ backgroundImage: `url(${siteUrl('samples/grain.png')})`, opacity: look.grain, mixBlendMode: 'overlay' }} />}
    </span>
  );
}
