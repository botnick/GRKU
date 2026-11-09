import { describe, expect, it } from 'vitest';
import { readFile } from './card';
import { readOnlyCard } from './packageCard';

const bytes = (text: string) => new TextEncoder().encode(text);

describe('readOnlyCard', () => {
  const card = readOnlyCard(
    [
      { path: 'SCRIPT/GRKU/PACKAGE.TXT', bytes: bytes('CORE.GRM\n') },
      { path: 'SCRIPT/STARTUP.TTL', bytes: bytes('ttl') },
    ],
    'GRKU.zip',
  );

  it('reads files by their paths, ignoring case as a FAT card does', async () => {
    expect(card.name).toBe('GRKU.zip');
    expect(new TextDecoder().decode((await readFile(card, 'script/grku/package.txt'))!)).toBe('CORE.GRM\n');
    expect(await readFile(card, 'SCRIPT/GRKU/MISSING.TXT')).toBeNull();
    const names: string[] = [];
    for await (const [name] of (await card.getDirectoryHandle('SCRIPT')).entries()) names.push(name);
    expect(names.sort()).toEqual(['GRKU', 'STARTUP.TTL']);
  });

  it('refuses writes and deletes', async () => {
    await expect(card.getDirectoryHandle('GRKU', { create: true })).rejects.toMatchObject({ name: 'NotAllowedError' });
    await expect(card.removeEntry('SCRIPT')).rejects.toMatchObject({ name: 'NotAllowedError' });
    const file = await (await card.getDirectoryHandle('SCRIPT')).getFileHandle('STARTUP.TTL');
    await expect(file.createWritable()).rejects.toMatchObject({ name: 'NotAllowedError' });
  });
});
