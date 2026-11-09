import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
url=os.environ.get('BUTTERFLY_URL','http://127.0.0.1:4173/the-butterfly-department/')
axe=Path(os.environ['AXE_PATH'])
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
 for size in [(1440,900),(390,844)]:
  c=b.new_context(viewport={'width':size[0],'height':size[1]});pg=c.new_page();pg.goto(url)
  for screen in ['title','morning','archive']:
   if screen=='morning':pg.locator('[data-action=start]').click();pg.locator('[data-action=assignment][data-id="0"]').click()
   if screen=='archive':pg.locator('[data-action=archive]').click()
   pg.add_script_tag(path=str(axe))
   data=pg.evaluate('async()=>await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa"]}})')
   v=[{'id':v['id'],'impact':v['impact'],'description':v['description'],'nodes':[n['target'] for n in v['nodes']]} for v in data['violations']]
   results.append({'screen':screen,'viewport':size,'violations':v})
  c.close()
 b.close()
Path('evidence/accessibility-results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
assert not any(r['violations'] for r in results),'Accessibility violations require repair'
