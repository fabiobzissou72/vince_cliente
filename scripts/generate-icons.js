const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputImage = path.join(__dirname, '..', 'public', 'logo.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Cria diretório se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Gera ícones para cada tamanho
Promise.all(
  sizes.map(size => {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    return sharp(inputImage)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 28, g: 40, b: 60, alpha: 1 }
      })
      .png()
      .toFile(outputPath)
      .then(() => console.log(`✓ Ícone ${size}x${size} criado`))
      .catch(err => console.error(`✗ Erro ao criar ícone ${size}x${size}:`, err));
  })
)
.then(() => console.log('\n✓ Todos os ícones foram gerados com sucesso!'))
.catch(err => console.error('\n✗ Erro geral:', err));
