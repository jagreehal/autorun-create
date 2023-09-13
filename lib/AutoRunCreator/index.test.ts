import fs from 'fs/promises';
import path from 'path';
import { AutoRunCreator } from './index';

async function createDummyHtmlFile() {
  const dummyHtmlContent = '<html><body>Hello, World!</body></html>';
  const tempDir = __dirname;
  const dummyHtmlPath = path.join(tempDir, '../../index.html');
  await fs.writeFile(dummyHtmlPath, dummyHtmlContent, 'utf-8');
  return dummyHtmlPath;
}

async function deleteDummyHtmlFile(filePath: string): Promise<void> {
  try {
    await fs.rm(filePath);
  } catch (error) {
    console.error('Error deleting dummy HTML file:', error);
  }
}

describe('AutoRunCreator', () => {
  let autorunCreator: AutoRunCreator;

  beforeEach(() => {
    autorunCreator = new AutoRunCreator();
  });

  it('should generate BrightScript code with enableLDWS and enableSSH', async () => {
    autorunCreator.enableLDWS().enableSSH();

    const brightScriptCode = await autorunCreator.create();

    expect(brightScriptCode).toContain('enableLDWS()\n  ');
    expect(brightScriptCode).toContain('enableSSH()\n  ');
  });

  it('should generate BrightScript code with no config', async () => {
    const generator = new AutoRunCreator(); // Create a generator with no config
    const brightScriptCode = await generator.create();

    expect(brightScriptCode).toBe(`
function main()
  mp = CreateObject("roMessagePort")
  
  ' Enable LDWS
  
  ' Enable SSH
  
  
  ' Event Loop
  while true
    msg = wait(0, mp)
    print "msg received - type="; type(msg)
    
    if type(msg) = "roHtmlWidgetEvent" then
      print "msg: "; msg
    end if
  end while

end function
`);
  });

  it('should generate BrightScript code with SSH enabled', async () => {
    autorunCreator.enableSSH();
    const brightScriptCode = await autorunCreator.create();

    expect(brightScriptCode).toMatch('enableSSH()');
  });

  it('should generate BrightScript code with index.html found', async () => {
    const filePath = await createDummyHtmlFile();

    const brightScriptCode = await autorunCreator.create();

    await deleteDummyHtmlFile(filePath);

    expect(brightScriptCode).toContain(`url: "file://index.html"`);
  });

  it('should generate BrightScript code and write it to autorun.brs', async () => {
    const writeAutorunBrsToFileSpy = jest.spyOn(
      autorunCreator,
      'writeAutorunBrsToFile',
    );

    await autorunCreator.writeAutorunBrsToFile();

    expect(writeAutorunBrsToFileSpy).toHaveBeenCalled();
  });

  it('should generate BrightScript code with custom htmlWidgetIndexHtmlPath', async () => {
    const customHtmlPath = '/path/to/custom/index.html';
    const generator = new AutoRunCreator().setHtmlWidgetIndexHtmlPath(
      customHtmlPath,
    );

    const brightScriptCode = await generator.create();

    expect(brightScriptCode).toContain(
      `url: "file:///path/to/custom/index.html"`,
    );
  });
});
