// Patch Next.js to work with Node.js 25.x
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', 'next', 'dist', 'build', 'index.js');

try {
  let content = fs.readFileSync(filePath, 'utf8');

  // Find the line that calls generateBuildId
  const searchPattern = '(0, _generatebuildid.generateBuildId)(config.generateBuildId, _indexcjs.nanoid)';
  const replacement = '(0, _generatebuildid.generateBuildId)(config.generateBuildId || (async () => null), _indexcjs.nanoid)';

  if (content.includes(searchPattern)) {
    content = content.replace(searchPattern, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Next.js patched successfully!');
  } else {
    console.log('⚠️  Pattern not found - Next.js might already be patched or version changed');
  }
} catch (error) {
  console.error('❌ Error patching Next.js:', error.message);
  process.exit(1);
}
