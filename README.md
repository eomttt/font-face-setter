# gen-font-face

## Installation

> npm install gen-font-face -g

or

> npx gen-font-face

## Usage

```
Usage: gen-font-face [options]

Options:
  -c, --config <dir>  Config dir
  -d, --dir <dir>     Parsing dir
  -o, --output <dir>  Output dir
  -h, --help          display help for command
```

## Options

### Using `config.json`

- When set config.json file you add specific font-weight, font-style
- If skip this file, default is only set `dir` and `output`

```json
{
  "dir" // Specify the directory to parse
  "weight" // font-weight offset
  "style" // Additional font style
  "output" // Specify the output directory
}
```

### -d, --dir (Default: `./fonts` directory)

> Specify the directory to parse.

### -o, --output (Default: `Directory to parse (./fonts)`)

> Specify the output directory.

### Example

```json
{
  "dir": "./fonts", // Specify the directory to parse
  "weight": {
    // font-weight offset
    "Thin": 100,
    "Light": 300,
    "Regular": 400
  },
  "style": {
    // Additional font style
    "font-display": "swap"
  },
  "output": "./dist" // Specify the output directory
}
```

Above this json file font.css write like this

```css
@font-face {
  font-family: 'FontName';
  src: url('FontName.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'FontNameWithWeight';
  src: url('FontNameWithWeight-Thin.woff2') format('woff2');
  font-weight: 100;
  font-display: swap;
}

@font-face {
  font-family: 'FontNameWithWeight';
  src: url('FontNameWithWeight-Light.woff2') format('woff2');
  font-weight: 300;
  font-display: swap;
}

@font-face {
  font-family: 'FontNameWithWeight';
  src: url('FontNameWithWeight-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

## Demo

![ezgif com-gif-maker (1)](https://user-images.githubusercontent.com/22593217/145664735-6db9328c-8760-4fa7-8187-76c58b6aac31.gif)
