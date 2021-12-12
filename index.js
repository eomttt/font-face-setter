#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');

const FileFormat = ['.eot', '.woff2', '.woff', '.ttf', '.otf'];
const FormatTypes = {
  ['eot']: 'embedded-opentype',
  ['woff2']: 'woff2',
  ['woff']: 'woff',
  ['ttf']: 'truetype',
  ['otf']: 'opentype',
};

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

function orderFontFiles(fontFiles) {
  return Object.entries(fontFiles).reduce((acc, [fontName, fontFiles]) => {
    return {
      ...acc,
      [fontName]: fontFiles.sort((a, b) => {
        const [aFormat] = a.split('.').slice(-1);
        const [bFormat] = b.split('.').slice(-1);

        return (
          FileFormat.indexOf(`.${aFormat}`) - FileFormat.indexOf(`.${bFormat}`)
        );
      }),
    };
  }, {});
}

function makeFontFamily(fontFiles, config) {
  const fontFamilyCSS = [];
  Object.entries(fontFiles).forEach(([fontName, fontFiles]) => {
    fontFamilyCSS.push(makeFontFamilyCSS(fontName, fontFiles, config));
  });

  return fontFamilyCSS.join('\n');
}

function getFontWeightCSS(fontStyles, configWeight = {}) {
  let fontWeight;
  const weightKeys = Object.keys(configWeight);

  fontStyles.some((fontStyle) => {
    if (weightKeys.includes(fontStyle)) {
      fontWeight = fontStyle;
      return true;
    }
    return false;
  });

  if (!fontWeight) {
    return '';
  }

  return '\n font-weight: ' + `${configWeight[fontWeight]};`;
}

function getFontStyleCSS(configStyle = {}) {
  const configStyleArr = Object.entries(configStyle);

  if (configStyleArr.length === 0) {
    return '';
  }

  return configStyleArr.reduce((acc, [key, value]) => {
    return `${acc}` + `\n ${key}: ${value};`;
  }, '');
}

function makeFontFamilyCSS(fontName, fontFiles, config) {
  const [pureFontName, ...rest] = fontName.split('-');

  let fontFamilyStyleString =
    '@font-face {\n font-family: ' + `'${pureFontName}'` + ';\n src:';

  for (let fontFile of fontFiles) {
    const [format] = fontFile.split('.').slice(-1);
    fontFamilyStyleString = `${fontFamilyStyleString} url('${fontFile}') format('${FormatTypes[format]}'),`;
  }

  fontFamilyStyleString = `${fontFamilyStyleString.slice(0, -1)}`;

  return (
    `${fontFamilyStyleString};` +
    getFontWeightCSS(rest, config?.weight) +
    getFontStyleCSS(config?.style) +
    '\n}'
  );
}

function main(options) {
  if (options.help) {
    return;
  }

  const configDir = options.config || './config.json';
  let config;

  try {
    config = JSON.parse(fs.readFileSync(configDir));
  } catch {
    // If can not find config file, pass
  }

  const parsingDir = options.dir || config?.dir || './fonts';
  const outputDir = options.output || config?.output || parsingDir;

  const fontFiles = readFontFile(parsingDir);
  const orderedFontFiles = orderFontFiles(fontFiles);
  const fontFamilyCSSString = makeFontFamily(orderedFontFiles, config);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(`${outputDir}/fonts.css`, fontFamilyCSSString);
}

program
  .option('-c, --config <dir>', 'Config dir')
  .option('-d, --dir <dir>', 'Parsing dir')
  .option('-o, --output <dir>', 'Output dir')
  .action(() => {
    const options = program.opts();
    console.log('options', options);
    main(options);
  });

// eslint-disable-next-line no-undef
program.parse(process.argv);
