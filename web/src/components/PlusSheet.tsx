import { useEffect, useId, useState } from 'react';
import { Check, Copy, Download, LoaderCircle, Smartphone, Sparkles, Upload } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Turnstile } from './Turnstile';
import { MAX_EFFECTS } from '../catalog';
import { cn } from '@/lib/utils';
import type { Language, Strings } from '../i18n';
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
  FREE,
  giftShort,
  ownedLines,
  orderStatus,
  payLink,
  redeemAngpao,
  TURNSTILE_SITEKEY,
  type Paid,
  type Tier,
  PlusError,
} from '../plus';

type View = 'tiers' | 'pay' | 'done' | 'key';
type Choice = 'plus' | 'slots25' | 'pack';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** The Turnstile language tag of each page language. */
const TURNSTILE_LANGUAGES: Readonly<Record<Language, string>> = { th: 'th', en: 'en', ja: 'ja', ko: 'ko', 'zh-Hans': 'zh-cn', 'zh-Hant': 'zh-tw' };

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
  /** An order to pay, from a phone that scanned the QR of the page (`#pay=<order>`). */
  payOrder?: string | null;
  /** The terms page of the language, which the buyer accepts. */
  termsHref: string;
  /** The language of the page, for the Turnstile widget's own words. */
  language: Language;
  /** Close the sheet and show the looks that a purchase unlocked. */
  onBrowse: () => void;
  /** How many looks the library has, or null until the catalog is here. */
  libraryLooks: number | null;
}

/**
 * GRKU Plus: the tiers, the PromptPay QR for the chosen one, the slip, and the key. Everything
 * runs in this panel; the page behind it unlocks as soon as the slip is accepted.
 */
export function PlusSheet({ open, onOpenChange, strings: t, owned, hasKey, onKey, onForget, packCounts, payOrder = null, termsHref, language, onBrowse, libraryLooks }: Props) {
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
  const [phoneQr, setPhoneQr] = useState<string | null>(null);
  const [gift, setGift] = useState('');
  /** The sheet opened from a phone that scanned the QR of this order: it pays, the other page waits. */
  const [phoneMode, setPhoneMode] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [human, setHuman] = useState<string | null>(null);
  const [humanReset, setHumanReset] = useState(0);

  const tier: Tier = choice === 'pack' ? `pack:${pack}` : choice;
  const totalLooks = libraryLooks ?? 135;
  const due = amountDue(tier, owned);
  const validEmail = EMAIL.test(email.trim());

  // The QR of the order, drawn when the order arrives.
  useEffect(() => {
    if (!order) {
      setQr(null);
      return;
    }
    let live = true;
    QRCode.toDataURL(order.promptpay, { margin: 1, width: 640, errorCorrectionLevel: 'H' })
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

  // The QR a phone scans to pay this order there (not on the phone itself).
  useEffect(() => {
    if (!order || phoneMode) {
      setPhoneQr(null);
      return;
    }
    let live = true;
    QRCode.toDataURL(payLink(order.order), { margin: 1, width: 320, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (live) setPhoneQr(url);
      })
      .catch(() => {
        if (live) setPhoneQr(null);
      });
    return () => {
      live = false;
    };
  }, [order, phoneMode]);

  // While the QR shows, ask the service every few seconds whether a phone has paid.
  useEffect(() => {
    if (view !== 'pay' || !order || phoneMode) return;
    let live = true;
    const timer = setInterval(() => {
      orderStatus(order.order)
        .then((state) => {
          if (!live || state.status !== 'paid') return;
          setPaid(state);
          onKey(state.key, state.entitlement);
          setView('done');
        })
        .catch(() => undefined);
    }, 4000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [view, order, phoneMode, onKey]);

  // A phone that opened #pay=<order>: load the order and show the pay view.
  useEffect(() => {
    if (!payOrder) return;
    let live = true;
    orderStatus(payOrder)
      .then((state) => {
        if (!live) return;
        if (state.status === 'open') {
          setOrder(state);
          setPhoneMode(true);
          setView('pay');
        } else if (state.status === 'paid') {
          setPaid(state);
          onKey(state.key, state.entitlement);
          setView('done');
        } else {
          setError(t.plus.orderExpired);
        }
      })
      .catch((failure) => {
        if (live) fail(failure);
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payOrder]);

  function reset() {
    setView('tiers');
    setOrder(null);
    setError(null);
    setBusy(false);
    setLinkSent(false);
    setCopied(false);
    setGift('');
    setPhoneMode(false);
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
      const made = await createOrder(tier, email.trim(), null, human);
      setOrder(made);
      setView('pay');
    } catch (failure) {
      if (failure instanceof PlusError && failure.status === 403) setError(t.plus.humanFailed);
      else fail(failure);
    } finally {
      // A token is redeemed once; the widget issues another for the next try.
      setHumanReset((n) => n + 1);
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

  async function sendGift() {
    const link = gift.trim();
    if (!link || !order) return;
    setBusy(true);
    setError(null);
    try {
      const result = await redeemAngpao(order.order, link);
      setPaid(result);
      onKey(result.key, result.entitlement);
      setView('done');
    } catch (failure) {
      const short = giftShort(failure);
      if (short) {
        setOrder({ ...order, amount: short.missing });
        setGift('');
        setError(t.plus.angpaoShort(short.got, short.missing));
      } else fail(failure);
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
      setPaid({ key, owner: result.owner, entitlement: result.entitlement });
      setView('done');
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
            <ol className="m-0 flex list-none flex-col gap-2 rounded-xl border bg-card p-3 text-[13px] leading-snug">
              {[t.plus.how1, t.plus.how2, t.plus.how3].map((step, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-brand-foreground">{index + 1}</span>
                  <span className="pt-px text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
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

            <p className="-mb-2 text-[13px] text-muted-foreground">{t.plus.outcomeFree(FREE.slots)}</p>
            <RadioGroup value={choice} onValueChange={(value) => setChoice(value as Choice)} className="gap-3">
              <TierCard
                id={`${ids}-plus`}
                value="plus"
                title={t.plus.tierAll}
                text={t.plus.tierAllText}
                outcome={t.plus.outcomeAll(totalLooks, MAX_EFFECTS)}
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
                outcome={t.plus.outcomeSlots(25)}
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
                outcome={t.plus.outcomePack(packCounts?.[pack] ?? 0, t.plus.packs[pack], FREE.slots, FREE.slots + (packCounts?.[pack] ?? 0))}
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

            <label htmlFor={`${ids}-agree`} className="flex cursor-pointer items-start gap-3 text-sm leading-normal">
              <Checkbox id={`${ids}-agree`} checked={agreed} onCheckedChange={(value) => setAgreed(value === true)} className="mt-0.5" />
              <span>
                {t.plus.acceptTerms[0]}
                <a href={termsHref} target="_blank" rel="noreferrer" className="font-medium text-brand hover:text-brand/80">
                  {t.plus.acceptTerms[1]}
                </a>
                {t.plus.acceptTerms[2]}
              </span>
            </label>
            <p className="flex items-start gap-2 text-[13px] text-muted-foreground">
              <span className="mt-[5px] inline-block size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
              {t.plus.transferNote}
            </p>
            {TURNSTILE_SITEKEY && (
              <div className="flex flex-col gap-1">
                <Turnstile siteKey={TURNSTILE_SITEKEY} action="plus-order" onToken={setHuman} resetKey={humanReset} language={TURNSTILE_LANGUAGES[language]} />
                {!human && <p className="text-[12px] text-muted-foreground">{t.plus.humanCheck}</p>}
              </div>
            )}
            <Button
              type="button"
              variant="brand"
              size="lg"
              className="h-11 text-[15px]"
              disabled={busy || !validEmail || hasTier(tier, owned) || !agreed || (!!TURNSTILE_SITEKEY && !human)}
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
            {/* The payment card, as a bank's Thai QR card: who is paid, how much, the order, and a
                watermark with the buyer, the order and the time, so a copy of the picture tells on itself. */}
            {(() => {
              const who = email.trim() || t.plus.email;
              const locale = language === 'th' ? 'th-TH' : language;
              const stamp = new Date().toLocaleString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              const minutes = Math.max(1, Math.round((order.expires - Date.now()) / 60000));
              const mark = `grku.app  ${who}  #${order.order.toUpperCase()}  ${stamp}`;
              const NAVY = '#0f3d6e';
              return (
                // A card in the layout of the Thai QR Payment standard: whose money it is, how much, and
                // a watermark with the buyer and the order across it, so a forwarded copy tells on itself.
                <div className="relative overflow-hidden rounded-xl bg-white text-neutral-900 shadow-sm">
                  <div className="relative z-[1] flex items-center gap-3 px-4 py-3" style={{ background: NAVY }}>
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-white/15">
                      <span className="flex size-9 items-center justify-center rounded bg-[#171717] font-sans text-[15px] font-extrabold text-white">G<span className="text-brand">.</span></span>
                    </span>
                    <span className="font-sans text-[22px] leading-[1.05] font-extrabold tracking-wide text-white">THAI QR<br />PAYMENT</span>
                  </div>
                  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
                    <div className="absolute -inset-x-1/2 top-0 bottom-0 -rotate-[24deg]">
                      {Array.from({ length: 14 }, (_, row) => (
                        <p key={row} className="m-0 truncate font-sans text-[13px] font-semibold leading-[38px] whitespace-nowrap text-neutral-900/[0.07]" style={{ paddingLeft: (row % 3) * 70 }}>
                          {`${mark}      `.repeat(4)}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="relative z-[1] flex flex-col items-center px-4 pt-5 pb-4">
                    <span className="flex items-baseline rounded-sm border-2 px-2 py-0.5 font-sans leading-none" style={{ borderColor: NAVY, color: NAVY }}>
                      <span className="text-[17px] font-semibold">Prompt</span>
                      <span className="text-[21px] font-extrabold">Pay</span>
                    </span>
                    <div className="relative my-4">
                      {qr ? (
                        <img src={qr} alt="PromptPay QR" width="232" height="232" className="block size-52 sm:size-56" />
                      ) : (
                        <div className="flex size-52 items-center justify-center sm:size-56">
                          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
                        </div>
                      )}
                      {qr && (
                        <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-white" aria-hidden="true">
                          <span className="flex size-7 items-center justify-center rounded bg-[#171717] font-sans text-[12px] font-extrabold text-white">G<span className="text-brand">.</span></span>
                        </span>
                      )}
                    </div>
                    <div className="flex w-full items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="m-0 truncate text-[16px] font-semibold">{order.receiver?.name ?? 'GRKU'}</p>
                        <p className="m-0 text-[12px] text-neutral-500">{order.receiver?.account}</p>
                      </div>
                      <div className="text-right">
                        <p className="m-0 font-sans text-[34px] leading-none font-bold tabular-nums">{order.amount.toFixed(2)}</p>
                        <p className="m-0 mt-1 text-[12px] text-neutral-500">{t.plus.baht} (BAHT)</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-[1] flex items-center gap-3 px-4 py-3 text-white" style={{ background: NAVY }}>
                    <span className="font-sans text-[15px] font-bold">QR Payment</span>
                    <span className="text-[13px] leading-snug text-white/85">
                      {t.plus.bankLine1}
                      <br />
                      {t.plus.bankLine2}
                    </span>
                  </div>
                  <div className="relative z-[1] bg-neutral-100 px-4 py-2.5 text-center text-[12.5px] leading-snug text-neutral-700">
                    <p className="m-0 font-semibold">{t.plus.issuedTo(who)}</p>
                    <p className="m-0">
                      {order.amount.toFixed(2)} {t.plus.baht} · {t.plus.orderRef} {order.order.toUpperCase()}
                    </p>
                    <p className="m-0">
                      {stamp} · {t.plus.singleUse(minutes)}
                    </p>
                  </div>
                </div>
              );
            })()}
            <div className="flex flex-col gap-2">
              {phoneMode && qr && (
                <Button asChild variant="outline" size="lg" className="h-11 text-[15px]">
                  <a href={qr} download={`grku-plus-${order.order}.png`}>
                    <Download aria-hidden="true" />
                    {t.plus.saveQr}
                  </a>
                </Button>
              )}
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

            {!phoneMode && (
              <div className="flex items-center gap-4 rounded-xl border bg-card p-3">
                <div className="shrink-0 overflow-hidden rounded-lg bg-white p-1.5">
                  {phoneQr ? <img src={phoneQr} alt="" width="96" height="96" className="block size-24" /> : <div className="size-24" />}
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <Smartphone className="size-4 text-muted-foreground" aria-hidden="true" />
                    {t.plus.phoneTitle}
                  </p>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{t.plus.phoneHint}</p>
                  <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <span className="inline-block size-2 animate-pulse rounded-full bg-amber-400" aria-hidden="true" />
                    {t.plus.phoneWaiting}
                  </p>
                </div>
              </div>
            )}

            {order.angpao && (
              <div className="flex flex-col gap-2">
                <Separator />
                <p className="text-sm font-semibold">{t.plus.angpaoTitle}</p>
                <p className="text-[13px] text-muted-foreground">{t.plus.angpaoHint}</p>
                <div className="flex gap-2">
                  <Input
                    value={gift}
                    onChange={(event) => setGift(event.target.value)}
                    placeholder={t.plus.angpaoPlaceholder}
                    inputMode="url"
                    spellCheck={false}
                    autoCapitalize="off"
                    className="font-mono text-xs"
                    aria-label={t.plus.angpaoTitle}
                  />
                  <Button type="button" variant="outline" disabled={busy || !gift.trim()} onClick={sendGift}>
                    {t.plus.angpaoUse}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {!phoneMode && (
              <Button type="button" variant="outline" size="sm" className="self-start" disabled={busy} onClick={reset}>
                {t.plus.changeTier}
              </Button>
            )}
          </div>
        )}

        {view === 'done' && paid && (
          <div className="flex flex-col gap-5 px-4 pb-6">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-brand/40 bg-brand/[0.08] px-4 py-5 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-brand text-brand-foreground">
                <Check className="size-6" aria-hidden="true" />
              </span>
              <p className="m-0 text-lg font-semibold">{t.plus.unlocked}</p>
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
                {ownedLines(paid.entitlement, t.plus, packCounts).map((line) => (
                  <li key={line} className="font-medium">{line}</li>
                ))}
              </ul>
            </div>
            <p className="m-0 text-sm text-muted-foreground">{t.plus.doneNext}</p>
            <Button
              type="button"
              variant="brand"
              size="lg"
              className="h-11 text-[15px]"
              onClick={() => {
                change(false);
                onBrowse();
              }}
            >
              <Sparkles aria-hidden="true" />
              {t.plus.browseUnlocked}
            </Button>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${ids}-key`}>{t.plus.yourKey}</Label>
              <div className="flex gap-2">
                <Input id={`${ids}-key`} readOnly value={paid.key} className="font-mono text-base tracking-wider" onFocus={(event) => event.target.select()} />
                <Button type="button" variant="outline" onClick={copyKey}>
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copied ? t.plus.copied : t.plus.copy}
                </Button>
              </div>
              <p className="m-0 text-[13px] text-muted-foreground">
                {t.plus.keyHint} {paid.owner !== 'anon' && t.plus.keySent}
              </p>
            </div>
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
  outcome,
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
  /** What the buyer gets, in looks on the card. */
  outcome: string;
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
        <span className={cn('mt-1 text-[15px] font-semibold', selected ? 'text-foreground' : 'text-foreground/90')}>→ {outcome}</span>
        <span className="mt-0.5 text-[13px] text-muted-foreground">{text}</span>
        {children}
      </span>
    </Label>
  );
}
