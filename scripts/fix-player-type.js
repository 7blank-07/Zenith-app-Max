const fs = require('fs');
const files = [
  'app/components/ComparePlayersTool.client.js',
  'app/components/HomeDashboardInteractions.client.js',
  'app/components/PlayersDatabaseInteractions.client.js',
  'app/components/SquadExportCapture.client.js',
  'app/components/SquadPlayerCustomizationModal.jsx',
  'app/components/ToolsInteractions.client.js',
  'app/page.js'
];

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  if (content.match(/player\?*\.leagueImage \? 'normal' : 'hero'/)) {
    let relativePath = './player-detail-utils';
    if (f === 'app/page.js') relativePath = './components/player-detail-utils';
    
    // Add import if not present
    if (!content.includes('getPlayerCardVariant')) {
      // Find the last import statement
      const importsMatch = content.match(/^import .*? from .*?;/gm);
      if (importsMatch) {
         const lastImport = importsMatch[importsMatch.length - 1];
         content = content.replace(lastImport, lastImport + '\nimport { getPlayerCardVariant } from \'' + relativePath + '\';');
      } else {
         content = 'import { getPlayerCardVariant } from \'' + relativePath + '\';\n' + content;
      }
    }

    content = content.replace(/player\?*\.leagueImage \? 'normal' : 'hero'/g, 'getPlayerCardVariant(player)');
    
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
}
console.log('Done.');
