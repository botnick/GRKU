import { useEffect, useId, useState } from 'react';
import { Check, Copy, LoaderCircle, Upload } from 'lucide-react';
import QRCode from 'qrcode';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Strings } from '../i18n';
import {
  amountDue,
  createOrder,
  errorKind,
  fetchEntitlement,
  hasTier,
  PACKS,
  PRICES,
  requestKey,
  submitSlip,
  type Entitlement,
  type Order,
  type Pack,
  type Paid,
  type Tier,
} from '../plus';

type View = 'tiers' | 'pay' | 'done' | 'key';
type Choice = 'plus' | 'slots25' | 'pack';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strings: Strings;
  owned: Entitlement;
  /** A key is saved on this device. */
  hasKey: boolean;
  /** A purchase or a pasted key gave `entitlement` for `key`. */
  onKey: (key: string, entitlement: Entitlement) => void;
  onForget: () => void;
  /** How many looks each pack holds, or null until the catalog is here. */
  packCounts: Record<Pack, number> | null;
}

/**
 * GRKU Plus: the tiers, the PromptPay QR for the chosen one, the slip, and the key. Everything
 * runs in this panel; the page behind it unlocks as soon as the slip is accepted.
 */
export function PlusSheet({ open, onOpenChange, strings: t, owned, hasKey, onKey, onForget, packCounts }: Props) {
  const ids = useId();
  const [view, setView] = useState<View>('tiers');
  const [choice, setChoice] = useState<Choice>('plus');
  const [pack, setPack] = useState<Pack>('kodak');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState<Paid | null>(null);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState('');
  const [linkSent, setLinkSent] = useState(false);

  const tier: Tier = choice === 'pack' ? `pack:${pack}` : choice;
  const due = amountDue(tier, owned);
  const validEmail = EMAIL.test(email.trim());

  // The QR of the order, drawn when the order arrives.
  useEffect(() => {
    if (!order) {
      setQr(null);
      return;
    }
    let live = true;
    QRCode.toDataURL(order.promptpay, { margin: 1, width: 640, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (live) setQr(url);
      })
      .catch(() => {
        if (live) setQr(null);
      });
    return () => {
      live = false;
    };
  }, [order]);

  function reset() {
    setView('tiers');
    setOrder(null);
    setError(null);
    setBusy(false);
    setLinkSent(false);
    setCopied(false);
  }

  function change(next: boolean) {
    onOpenChange(next);
    if (!next && view !== 'pay') reset();
  }

  const fail = (failure: unknown) => setError(t.plus[errorKind(failure)]);

  async function startOrder() {
    setBusy(true);
    setError(null);
    try {
      const made = await createOrder(tier, email.trim(), null);
      setOrder(made);
      setView('pay');
    } catch (failure) {
      fail(failure);
    } finally {
      setBusy(false);
    }
  }

  async function sendSlip(file: File | undefined) {
    if (!file || !order) return;
    setBusy(true);
    setError(null);
    try {
      const result = await submitSlip(order.order, file);
      setPaid(result);
      onKey(result.key, result.entitlement);
      setView('done');
    } catch (failure) {
      fail(failure);
    } finally {
      setBusy(false);
    }
  }

  async function useKey() {
    const key = pasted.trim();
    if (!key) return;
    setBusy(true);
    setError(null);
    try {
      const result = await fetchEntitlement(key);
      onKey(key, result.entitlement);
      setPasted('');
      setView('tiers');
    } catch (failure) {
      fail(failure);
    } finally {
      setBusy(false);
    }
  }

  async function sendLink() {
    setBusy(true);
    setError(null);
    try {
      await requestKey(email.trim());
      setLinkSent(true);
    } catch (failure) {
      fail(failure);
    } finally {
      setBusy(false);
    }
  }

  async function copyKey() {
    if (!paid) return;
    try {
      await navigator.clipboard.writeText(paid.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // The key is on the screen to select.
    }
  }

  const price = (baht: number) => (
    <span className="font-mono text-base font-semibold tabular-nums">฿{baht}</span>
  );

  return (
    <Sheet open={open} onOpenChange={change}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-xl">{t.plus.title}</SheetTitle>
          <SheetDescription>{t.plus.lead}</SheetDescription>
        </SheetHeader>

        {(view === 'tiers' || view === 'key') && (
          <Tabs value={view} onValueChange={(value) => { setError(null); setView(value as View); }} className="px-4 pb-4">
            <TabsList className="grid h-10 w-full grid-cols-2">
              <TabsTrigger value="tiers" className="text-sm">{t.plus.getMore}</TabsTrigger>
              <TabsTrigger value="key" className="text-sm">{t.plus.haveKey}</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {view === 'tiers' && (
          <div className="flex flex-col gap-5 px-4 pb-6">
            {hasKey && (
              <Alert>
                <Check aria-hidden="true" />
                <AlertTitle>{t.plus.active}</AlertTitle>
                <AlertDescription>
                  <Button type="button" variant="link" size="sm" className="h-auto p-0 text-[13px] text-muted-foreground" onClick={onForget}>
                    {t.plus.forget}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <RadioGroup value={choice} onValueChange={(value) => setChoice(value as Choice)} className="gap-3">
              <TierCard
                id={`${ids}-plus`}
                value="plus"
                title={t.plus.tierAll}
                text={t.plus.tierAllText}
                price={price(PRICES.plus)}
                owned={hasTier('plus', owned)}
                ownedLabel={t.plus.owned}
                selected={choice === 'plus'}
              >
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                  <li>{t.plus.newLooks}</li>
                  <li>{t.plus.lifetime}</li>
                </ul>
                {owned.paid > 0 && !owned.plus && <p className="mt-2 text-[13px] text-muted-foreground">{t.plus.credit(owned.paid)}</p>}
              </TierCard>
              <TierCard
                id={`${ids}-slots`}
                value="slots25"
                title={t.plus.tierSlots}
                text={t.plus.tierSlotsText}
                price={price(PRICES.slots25)}
                owned={hasTier('slots25', owned)}
                ownedLabel={t.plus.owned}
                selected={choice === 'slots25'}
              />
              <TierCard
                id={`${ids}-pack`}
                value="pack"
                title={t.plus.tierPack}
                text={t.plus.tierPackText}
                price={price(PRICES['pack:kodak'])}
                owned={false}
                ownedLabel={t.plus.owned}
                selected={choice === 'pack'}
              >
                {choice === 'pack' && (
                  <Select value={pack} onValueChange={(value) => setPack(value as Pack)}>
                    <SelectTrigger className="mt-3 w-full bg-background" aria-label={t.plus.tierPack}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {PACKS.map((item) => (
                        <SelectItem key={item} value={item} disabled={hasTier(`pack:${item}`, owned)}>
                          {t.plus.packs[item]}
                          {packCounts && <span className="text-muted-foreground"> · {t.plus.packCount(packCounts[item])}</span>}
                          {hasTier(`pack:${item}`, owned) && <span className="text-muted-foreground"> · {t.plus.owned}</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </TierCard>
            </RadioGroup>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${ids}-email`}>{t.plus.email}</Label>
              <Input
                id={`${ids}-email`}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
              <p className="text-[13px] text-muted-foreground">{t.plus.emailNote}</p>
            </div>

            <Button
              type="button"
              variant="brand"
              size="lg"
              className="h-11 text-[15px]"
              disabled={busy || !validEmail || hasTier(tier, owned)}
              aria-busy={busy}
              onClick={startOrder}
            >
              {busy && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {t.plus.pay(due)}
            </Button>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <p className="text-[13px] text-muted-foreground">{t.plus.includesFree}</p>
          </div>
        )}

        {view === 'pay' && order && (
          <div className="flex flex-col gap-5 px-4 pb-6">
            <p className="text-sm">{t.plus.scan(order.amount)}</p>
            <div className="mx-auto w-fit rounded-2xl bg-white p-3">
              {qr ? (
                <img src={qr} alt="PromptPay QR" width="256" height="256" className="block size-64" />
              ) : (
                <div className="flex size-64 items-center justify-center text-black">
                  <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
                </div>
              )}
            </div>
            <p className="text-center font-mono text-3xl font-semibold tabular-nums">฿{order.amount}</p>
            <Separator />
            <div className="flex flex-col gap-2">
              <Button asChild variant="brand" size="lg" className={cn('h-11 text-[15px]', busy && 'pointer-events-none opacity-60')}>
                <label htmlFor={`${ids}-slip`}>
                  {busy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
                  {busy ? t.plus.checking : t.plus.uploadSlip}
                </label>
              </Button>
              <input
                id={`${ids}-slip`}
                className="sr-only"
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  void sendSlip(file);
                }}
              />
              <p className="text-[13px] text-muted-foreground">{t.plus.slipNote}</p>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="button" variant="ghost" size="sm" className="self-start" disabled={busy} onClick={reset}>
              {t.plus.back}
            </Button>
          </div>
        )}

        {view === 'done' && paid && (
          <div className="flex flex-col gap-5 px-4 pb-6">
            <Alert className="border-brand/40">
              <Check aria-hidden="true" />
              <AlertTitle>{t.plus.unlocked}</AlertTitle>
              <AlertDescription>{paid.owner !== 'anon' && t.plus.keySent}</AlertDescription>
            </Alert>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${ids}-key`}>{t.plus.yourKey}</Label>
              <div className="flex gap-2">
                <Input id={`${ids}-key`} readOnly value={paid.key} className="font-mono text-xs" onFocus={(event) => event.target.select()} />
                <Button type="button" variant="outline" onClick={copyKey}>
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copied ? t.plus.copied : t.plus.copy}
                </Button>
              </div>
            </div>
            <Button type="button" variant="brand" onClick={() => change(false)}>
              {t.done}
            </Button>
          </div>
        )}

        {view === 'key' && (
          <div className="flex flex-col gap-5 px-4 pb-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${ids}-paste`}>{t.plus.yourKey}</Label>
              <div className="flex gap-2">
                <Input
                  id={`${ids}-paste`}
                  value={pasted}
                  onChange={(event) => setPasted(event.target.value)}
                  placeholder={t.plus.pasteKey}
                  className="font-mono text-xs"
                  spellCheck={false}
                  autoCapitalize="off"
                />
                <Button type="button" variant="brand" disabled={busy || !pasted.trim()} onClick={useKey}>
                  {t.plus.useKey}
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${ids}-email2`}>{t.plus.orEmail}</Label>
              <div className="flex gap-2">
                <Input
                  id={`${ids}-email2`}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
                <Button type="button" variant="outline" disabled={busy || !validEmail} onClick={sendLink}>
                  {t.plus.sendLink}
                </Button>
              </div>
              {linkSent && <p className="text-sm text-muted-foreground">{t.plus.linkSent}</p>}
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/** A tier on a card: the radio, the name and the price on one line, the text under them. */
function TierCard({
  id,
  value,
  title,
  text,
  price,
  owned,
  ownedLabel,
  selected,
  children,
}: {
  id: string;
  value: Choice;
  title: string;
  text: string;
  price: React.ReactNode;
  owned: boolean;
  ownedLabel: string;
  selected: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border-2 border-border bg-card p-4 text-left text-base leading-normal font-normal transition-colors hover:border-foreground/40',
        selected && 'border-brand bg-brand/5 hover:border-brand',
        owned && 'cursor-default opacity-70',
      )}
    >
      <RadioGroupItem id={id} value={value} className="mt-1" disabled={owned} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center justify-between gap-3">
          <span className="font-semibold">{title}</span>
          {owned ? <Badge variant="outline">{ownedLabel}</Badge> : <span className={cn(selected && 'text-brand')}>{price}</span>}
        </span>
        <span className="mt-0.5 text-sm text-muted-foreground">{text}</span>
        {children}
      </span>
    </Label>
  );
}
