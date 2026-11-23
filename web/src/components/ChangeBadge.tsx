import { Badge } from '@/components/ui/badge';
import type { Strings } from '../i18n';

/** The change badge of an effect or a module: what a write to the card does with it. */
export function ChangeBadge({
  on,
  checked,
  changed = false,
  strings: t,
}: {
  on: boolean;
  checked: boolean;
  /** The file on the card differs from the effect of the page. */
  changed?: boolean;
  strings: Strings;
}) {
  if (checked && !on) return <Badge variant="outline">{t.changeAdds}</Badge>;
  if (!checked && on)
    return (
      <Badge variant="outline" className="border-destructive text-destructive">
        {t.changeRemoves}
      </Badge>
    );
  if (checked && changed) return <Badge variant="outline">{t.changeUpdates}</Badge>;
  return null;
}
