/** Sentences as one text: a space after a Latin full stop, none after a CJK one. */
export const sentences = (...texts: string[]): string =>
  texts.reduce((text, next) => (/[。！？]$/.test(text) ? text + next : `${text} ${next}`));
