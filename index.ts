#!/usr/bin/env node

import { AutoRunCreator } from './lib/AutoRunCreator';
import fs from 'fs/promises';
import { exists } from 'fs-exists-async';
import { AutoRunCreatorConfig } from './types';

async function loadConfigFromFile(
  filePath: string,
): Promise<AutoRunCreatorConfig | undefined> {
  try {
    const fileExists = await exists(filePath);

    if (fileExists) {
      const configData = await fs.readFile(filePath, { encoding: 'utf-8' });
      return JSON.parse(configData) as AutoRunCreatorConfig;
    } else {
      console.log(
        `Config file not found at ${filePath}. Using default settings.`,
      );
    }
  } catch (error) {
    console.error(`Error loading config file: ${error}`);
  }
}

async function main() {
  const configFilePath = './autorun.config.json';
  const config: AutoRunCreatorConfig | undefined =
    await loadConfigFromFile(configFilePath);

  const generator = new AutoRunCreator(config);
  await generator.writeAutorunBrsToFile();
}

main()
  .then(() => {
    console.log('Autorun.brs created successfully!');
  })
  .catch((error) => {
    console.error('An unexpected error occurred:', error);
  });
