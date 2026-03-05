import fs from 'node:fs';
import path from 'node:path';
import LegacyAppShell from '../legacy-app-shell';

function readLegacyBodyHtml() {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'legacy-body.html');
  if (!fs.existsSync(filePath)) {
    return '<div style="padding: 24px; font-family: sans-serif;">Legacy markup not generated yet. Run npm run dev/build once.</div>';
  }
  return fs.readFileSync(filePath, 'utf8');
}

export default function LegacyPage() {
  const html = readLegacyBodyHtml();
  return <LegacyAppShell html={html} />;
}
