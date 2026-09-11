const fs = require('fs');
const path = require('path');

const repoPath = path.join(__dirname, 'learn-godot');
const lessonRelPath = 'lessons/programming/02';
const lessonPath = path.join(repoPath, lessonRelPath);
const outDir = path.join(__dirname, 'export-modulo-02-clean');

// Remove existing export folder to clean up previous large bundle
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Copy lesson index.html
let html = fs.readFileSync(path.join(lessonPath, 'index.html'), 'utf8');
html = html.replace(/\.\.\/\.\.\/\.\.\//g, './');

// Injetar CSS para embutir na plataforma KodaBooks (esconder botões desnecessários e arrumar layout)
const kodabooksFixes = `
    <style>
        /* Ajustes exclusivos para rodar dentro do iframe do KodaBooks */
        .back-link { display: none !important; }
        .lesson-tag { display: none !important; }
        .module-nav { display: none !important; }
        
        /* Previne que o conteúdo seja engolido pela topbar fixa em telas menores (iframe) */
        .deck { 
            padding-top: 65px !important; 
            align-items: flex-start !important; 
        }
        .deck .slide {
            margin-top: auto;
            margin-bottom: auto;
        }
        
        /* Centraliza a topbar para alinhar exatamente com o conteúdo do slide (1100px) */
        .topbar {
            max-width: 1100px !important;
            margin: 0 auto !important;
            width: 100% !important;
            box-sizing: border-box !important;
            background: transparent !important;
            border-bottom: none !important;
        }
    </style>
</head>`;
html = html.replace('</head>', kodabooksFixes);

fs.writeFileSync(path.join(outDir, 'index.html'), html);

// Copy specific needed files and directories (NOT entire assets folder)
const filesToCopy = [
  'style.css',
  'script.js',
  'assets/fonts',
  'assets/icons-ui',
  'assets/icons/Node.svg',
  'assets/course.js'
];

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

filesToCopy.forEach(item => {
  const src = path.join(repoPath, item);
  const dest = path.join(outDir, item);
  copyRecursiveSync(src, dest);
});

console.log('✅ Bundle limpo criado em: ' + outDir);
