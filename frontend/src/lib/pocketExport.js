export function pocketMarkdown(data, origin) {
  const escape = (text) =>
    String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/([\\`*_{}[\]()#+.!|<>-])/g, '\\$1');
  const lines = ['# My campus pocket', '', `Snapshot: ${data.generatedAt}`, ''];
  for (const item of data.items) {
    lines.push(`## ${escape(item.title).replace(/[\r\n]+/g, ' ')}`, '');
    lines.push(`${escape(item.category)} · ${escape(item.authorName || 'Campus contributor')}`, '');
    lines.push(
      ...String(item.description || '')
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => `> ${escape(line)}`),
      '',
    );
    if (Number.isSafeInteger(item.id) && item.id > 0) {
      const url = new URL(`/nodes/${item.id}`, origin);
      if (['http:', 'https:'].includes(url.protocol))
        lines.push(`[Open on Campus Genome](${url.href})`, '');
    }
  }
  if (!data.items.length) lines.push('Your pocket is empty. Save a campus find and try again.', '');
  return lines.join('\n');
}
