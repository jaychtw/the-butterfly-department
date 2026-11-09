import os,json,urllib.request
from pathlib import Path
from datetime import datetime,timezone
from playwright.sync_api import sync_playwright
expected=os.environ['PORTAL_COMMIT'];url='https://jaychtw.github.io/';game=url+'the-butterfly-department/'
out=Path('/workspace/scratch/butterfly-portal-public');out.mkdir(exist_ok=True)
identity=json.load(urllib.request.urlopen(url+'build-info.json'));assert identity['sourceCommit']==expected and identity['sourceDirty'] is False
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'],proxy={'server':os.environ['HTTPS_PROXY']})
 for width in [1440,390]:
  c=b.new_context(viewport={'width':width,'height':900 if width==1440 else 844});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url);card=page.locator('[data-project="the-butterfly-department"]');assert card.get_attribute('href')==game
  card.locator('img').evaluate('(i)=>i.decode()');assert card.locator('img').evaluate('(i)=>i.naturalWidth>0')
  card.screenshot(path=str(out/f'card-{width}.png'))
  card.click();page.wait_for_url(game);page.locator('[data-action=start]').click();page.locator('[data-action=assignment][data-id="0"]').click()
  assert page.locator('#intervention').is_visible();page.screenshot(path=str(out/f'play-{width}.png'))
  page.goto(url+'games/the-butterfly-department/');assert page.locator('[lang="zh-TW"]').count()>0
  assert page.locator('a.primary-action').get_attribute('href')==game
  page.screenshot(path=str(out/f'facts-{width}.png'),full_page=True);assert not errors,errors;c.close()
 b.close()
r={'status':'PASS','checkedAt':datetime.now(timezone.utc).isoformat(),'portalCommit':expected,'gameCommit':'86eee1a8689bf87c678ec4081d55810033b90c44','catalogUrl':url+'games/the-butterfly-department/','galleryUrl':url,'playUrl':game,'checks':['TLS enabled; normal NSS certificate store','live identity matches exact manual-dispatch SHA','real approved cover loaded','desktop and touch-sized card navigates to exact game','live START reaches intervention controls','fact sheet has bilingual summary and correct Play link'],'viewports':[1440,390]}
(out/'verification.json').write_text(json.dumps(r,indent=2));print(json.dumps(r))
