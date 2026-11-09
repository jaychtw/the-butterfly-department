import os,json,hashlib,urllib.request
from pathlib import Path
from datetime import datetime,timezone
from playwright.sync_api import sync_playwright
url='https://jaychtw.github.io/the-butterfly-department/'
root=Path('/workspace/the-butterfly-department');out=Path('/workspace/scratch/butterfly-public');out.mkdir(exist_ok=True)
expected=os.environ['GAME_COMMIT']
identity=json.load(urllib.request.urlopen(url+'build.json'))
assert identity['commit']==expected and identity['version']=='1.0.1',identity
files=[]
for f in sorted((root/'dist/the-butterfly-department').rglob('*')):
 if not f.is_file():continue
 relative=f.relative_to(root/'dist/the-butterfly-department').as_posix()
 response=urllib.request.urlopen(url+relative);body=response.read();assert body==f.read_bytes(),relative
 files.append({'path':relative,'sha256':hashlib.sha256(body).hexdigest(),'status':response.status})
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'],proxy={'server':os.environ['HTTPS_PROXY']})
 page=b.new_page(viewport={'width':1440,'height':900});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 response=page.goto(url);assert response.status==200
 page.screenshot(path=str(out/'title-live.png'))
 page.locator('[data-action=start]').click();page.locator('[data-action=assignment][data-id="0"]').click()
 page.locator('input[value=repair]').check();page.locator('button[type=submit]').click();page.locator('[data-action=finish]').click()
 assert 'oven works again' in page.locator('#phase').inner_text()
 page.screenshot(path=str(out/'repair-live.png'))
 page.locator('[data-action=archive]').click();page.locator('[data-action=archive-tab][data-id=connections]').click()
 assert page.locator('.deps a').count()>0;page.screenshot(path=str(out/'archive-live.png'))
 page.locator('[data-action=close]').click();page.locator('[data-action=rewind]').click();page.locator('[data-action=fork]').click()
 page.locator('input[value=delay]').check();page.locator('button[type=submit]').click();page.locator('[data-action=finish]').click()
 assert 'Missed opportunity: employment appointment' in page.locator('#phase').inner_text()
 page.screenshot(path=str(out/'late-appointment-live.png'))
 assert not errors,errors
 b.close()
receipt={'status':'PASS','checkedAt':datetime.now(timezone.utc).isoformat(),'url':url,'commit':expected,'identity':identity,'files':files,'browser':['TLS verification enabled with inherited proxy and trusted NSS CA store','real START','ordinary repair intervention and completed repair','causal archive with actual input links','ordinary delayed departure produces a real missed private appointment'],'limitations':['Chromium desktop only for this independent live check; comprehensive local touch and failure checks recorded separately']}
(out/'verification.json').write_text(json.dumps(receipt,indent=2))
print(json.dumps({'status':'PASS','commit':expected,'fileCount':len(files),'url':url}))
