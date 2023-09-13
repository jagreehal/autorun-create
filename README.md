# autorun-create

`autorun-create` is a command-line tool that simplifies the process of creating BrightScript code for an `autorun.brs` file for BrightSign players.

## Features

- Automatically detects the presence of an `index.html` file in the project directory.
- Generates BrightScript code for creating an HTML widget with the detected `index.html` file.
- Allows customization of features such as LDWS (Low-Density Screen Warning System) and SSH (Secure Shell) enablement.
- Writes the generated BrightScript code to an `autorun.brs` file in the specified output directory.

## Installation

To install AutoRunCreator, you can use npm:

```bash
npm install -g autorun-create
```

## Usage

To generate an autorun.brs file with default settings, simply run:

```bash
autorun-create
```

## Configuration

You can customize the behavior of AutoRunCreator by creating a `autorun.config.json` file in root of your project directory.

Here's an example of a autorun.config.json file:

```json
{
  "enableLDWS": true,
  "enableSSH": false,
  "htmlWidgetIndexHtmlPath": "path/to/your/index.html",
  "outputDirectory": "./output"
}
```

- enableLDWS (boolean): Enable or disable the Low-Density Screen Warning System (LDWS) feature. Default is false.
- enableSSH (boolean): Enable or disable SSH (Secure Shell) for debugging. Default is false.
- htmlWidgetIndexHtmlPath (string): Path to your index.html file. > If not provided, AutoRunCreator will search for index.html in your project directory.
- outputDirectory (string): Specify the directory where the autorun.brs file should be saved. Default is the project directory.
