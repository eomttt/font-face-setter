#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');

const FileFormat = ['.otf', '.ttf', '.woff', '.woff2'];

function readFontFile(dirName) {
  let fontFiles = {};
  const dirs = fs.readdirSync(dirName);

  for (let dir of dirs) {
    if (fs.lstatSync(`${dirName}/${dir}`).isFile()) {
      const fileFormat = path.extname(dir);
      if (FileFormat.includes(fileFormat)) {
        const [fontName] = dir.split(fileFormat);

        fontFiles[fontName] = fontFiles[fontName]
          ? [...fontFiles[fontName], `/${dirName}/${dir}`]
          : [`/${dirName}/${dir}`];
      }
    } else {
      fontFiles = {
        ...fontFiles,
        ...readFontFile(`${dirName}/${dir}`),
      };
    }
  }

  return fontFiles;
}

function makeFontFamily(fontFiles) {
  const fontFamilyCSS = [];
  Object.entries(fontFiles).forEach(([fontName, fontFiles]) => {
    fontFamilyCSS.push(makeFontFamilyCSS(fontName, fontFiles));
  });

  return fontFamilyCSS.join('\n');
}

function makeFontFamilyCSS(fontName, fontFiles) {
  const [pureFontName] = fontName.split('-');

  let fontFamilyStyleString =
    '@font-face {\n font-family: ' + `'${pureFontName}'` + ';\n src:';

  for (let fontFile of fontFiles) {
    fontFamilyStyleString = `${fontFamilyStyleString} url('${fontFile}'),`;
  }

  return `${fontFamilyStyleString.slice(0, -1)};` + '\n}';
}

function main(options) {
  if (options.help) {
    return;
  }

  const parsingDir = options.dir || './fonts';
  const outputDir = options.output || './dist';

  const fontFiles = readFontFile(parsingDir);
  const fontFamilyCSSString = makeFontFamily(fontFiles);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(`${outputDir}/fonts.css`, fontFamilyCSSString);
}

program
  .option('-d, --dir <dir>', 'Parsing dir')
  .option('-o, --output <dir>', 'Output dir')
  .action(() => {
    const options = program.opts();
    main(options);
  });

// eslint-disable-next-line no-undef
program.parse(process.argv);
