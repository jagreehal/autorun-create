import * as fs from 'fs/promises';
import * as path from 'path';
import { exists } from 'fs-exists-async';
import { AutoRunCreatorConfig } from '../../types';

const DEFAULT_CONFIG: AutoRunCreatorConfig = {
  enableLDWS: false,
  enableSSH: false,
  htmlWidgetIndexHtmlPath: '',
  outputDirectory: './',
};

export class AutoRunCreator {
  private config: AutoRunCreatorConfig;
  private indexHtmlPath: string | undefined;

  constructor(config: AutoRunCreatorConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.indexHtmlPath = config.htmlWidgetIndexHtmlPath;
  }

  private async checkForIndexHtml(): Promise<void> {
    const currentDir = process.cwd();
    const srcIndexPath = path.resolve(currentDir, 'src', 'index.html');
    const rootIndexPath = path.resolve(currentDir, 'index.html');
    if (await exists(srcIndexPath)) {
      this.indexHtmlPath = path.relative(currentDir, srcIndexPath);
    } else if (await exists(rootIndexPath)) {
      this.indexHtmlPath = path.relative(currentDir, rootIndexPath);
    }
  }

  enableLDWS(): AutoRunCreator {
    this.config = { ...this.config, enableLDWS: true };
    return this;
  }

  enableSSH(): AutoRunCreator {
    this.config = { ...this.config, enableSSH: true };
    return this;
  }

  setHtmlWidgetIndexHtmlPath(path: string): AutoRunCreator {
    this.indexHtmlPath = path;
    return this;
  }

  private generateLDWSCode(): string {
    return `
function enableLDWS()
  registrySection = CreateObject("roRegistrySection", "networking")
  
  if type(registrySection) = "roRegistrySection" then 
    registrySection.Write("http_server", "80")
  end if

  registrySection.Flush()
end function
`;
  }

  private generateSSHCode(): string {
    return `
function enableSSH()
  regSSH = CreateObject("roRegistrySection", "networking")
  
  if type(regSSH) = "roRegistrySection" then
    regSSH.Write("ssh", "22")
  endif

  n = CreateObject("roNetworkConfiguration", 0)
  n.SetLoginPassword("password")
  n.Apply()

  regSSH.Flush()
end function
`;
  }

  private generateHTMLWidgetCode(): string {
    if (!this.indexHtmlPath) {
      return '';
    }

    const indexHtmlUrl = `file://${this.indexHtmlPath}`;
    return `
function createHTMLWidget(mp as object) as object
  reg = CreateObject("roRegistrySection", "html")
  reg.Write("enable_web_inspector", "1")
  reg.Flush()

  vidmode = CreateObject("roVideoMode")
  width = vidmode.GetResX()
  height = vidmode.GetResY()

  r = CreateObject("roRectangle", 0, 0, width, height)
  
  config = {
    nodejs_enabled: true,
    inspector_server: {
      port: 3000
    },
    url: "${indexHtmlUrl}",
    port: mp
  }
  
  h = CreateObject("roHtmlWidget", r, config)
  return h
end function
`;
  }

  async create() {
    if (!this.indexHtmlPath) {
      await this.checkForIndexHtml();
    }

    const { enableLDWS, enableSSH } = this.config;

    const mainCode = `
function main()
  mp = CreateObject("roMessagePort")
  
  ${enableLDWS ? 'enableLDWS()\n  ' : ''}
  ${enableSSH ? 'enableSSH()\n  ' : ''}
  ${
    this.indexHtmlPath ? 'widget = createHTMLWidget(mp)\n  widget.Show()\n' : ''
  }
  while true
    msg = wait(0, mp)
    print "msg received - type="; type(msg)
    
    if type(msg) = "roHtmlWidgetEvent" then
      print "msg: "; msg
    end if
  end while

end function
`;

    const ldwsCode = enableLDWS ? this.generateLDWSCode() : '';
    const sshCode = enableSSH ? this.generateSSHCode() : '';
    const widgetCode = this.indexHtmlPath ? this.generateHTMLWidgetCode() : '';

    return `${mainCode}${ldwsCode}${sshCode}${widgetCode}`;
  }

  async writeAutorunBrsToFile(outputDirectory?: string): Promise<void> {
    const autorunContent = await this.create();
    const autorunBrsPath = path.join(
      outputDirectory || this.config.outputDirectory || './',
      'autorun.brs',
    );

    try {
      await fs.writeFile(autorunBrsPath, autorunContent, 'utf-8');
      console.log('autorun.brs file generated successfully!');
    } catch (error) {
      console.error('Error writing autorun.brs file:', error);
    }
  }
}
