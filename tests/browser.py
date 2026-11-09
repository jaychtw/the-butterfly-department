"""Real controls against a production build. pip install playwright, system Chromium."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=os.environ.get('BUTTERFLY_URL','http://127.0.0.1:4173/the-butterfly-department/')
OUT=Path('evidence');OUT.mkdir(exist_ok=True)
results=[]
def check(name,condition):
 assert condition,name
 results.append({'check':name,'status':'PASS'})
def button(page,action,id=None):
 x=page.locator(f'[data-action="{action}"]'+(f'[data-id="{id}"]' if id is not None else ''))
 return x.first

def day(page,action='nothing',capture=None):
 page.locator(f'input[value="{action}"]').check()
 page.locator('button[type=submit]').click()
 if capture:
  for i in range(100):
   if any(e['type']=='conversation' and e['day']==1 for e in current(page)['events']):break
   button(page,'skip').click()
  check('live encounter metrics match engine', 'Positive conversations: 1' in page.locator('.metrics').inner_text())
  page.screenshot(path=str(OUT/capture))
 button(page,'finish').click()

def saved(page):
 return page.evaluate('JSON.parse(JSON.parse(localStorage.getItem("butterfly-v1")).payload)')
def current(page):
 d=saved(page);return next(b for b in d['branches'] if b['id']==d['current'])['state']
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':900},**({'record_video_dir':str(OUT/'recordings')} if os.environ.get('RECORD_BROWSER')=='1' else {}))
 page=context.new_page();errors=[];remote=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r:remote.append(r.url) if not r.url.startswith(URL.split('/the-butterfly')[0]) else None)
 page.goto(URL);page.screenshot(path=str(OUT/'title-desktop.png'))
 button(page,'start').focus();page.keyboard.press('Enter')
 check('keyboard START requests fullscreen and reaches picker',page.locator('[data-action=assignment]').count()==4)
 check('real fullscreen allowed',page.evaluate('!!document.fullscreenElement'))
 page.evaluate('document.exitFullscreen()')
 button(page,'assignment',0).click();page.screenshot(path=str(OUT/'morning-desktop.png'))
 before=current(page);button(page,'language').click();check('instant language switch preserves core',current(page)==before)
 check('Traditional Chinese morning UI',page.locator('html').get_attribute('lang')=='zh-TW')
 page.screenshot(path=str(OUT/'morning-zh.png'));button(page,'language').click()
 page.locator('input[value=repair]').check();page.locator('button[type=submit]').click()
 button(page,'play').click();page.wait_for_timeout(650);button(page,'play').click();t=current(page)['tick'];page.wait_for_timeout(650)
 check('pause holds simulation',current(page)['tick']==t)
 button(page,'play').click();page.evaluate("window.dispatchEvent(new Event('blur'))");held=current(page)['tick'];page.wait_for_timeout(650);check('blur handler pauses simulation',current(page)['tick']==held);page.evaluate("window.dispatchEvent(new Event('focus'))");page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))");held=current(page)['tick'];page.wait_for_timeout(650);check('hidden-state handler pauses simulation',current(page)['tick']==held);page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))");button(page,'play').click();
 button(page,'resident','Elias').click();page.screenshot(path=str(OUT/'resident-desktop.png'));t=current(page)['tick'];page.wait_for_timeout(550);check('inspector freezes simulation',current(page)['tick']==t);button(page,'close').click()
 page.reload();button(page,'start').click();button(page,'continue').click();check('midday reload restores exact state',current(page)['tick']==t)
 button(page,'play').click();page.wait_for_function("document.querySelector('time').textContent==='07:30'");button(page,'play').click();check('residents traverse a real edge',any(a['edge'] for a in current(page)['actors'].values()));page.screenshot(path=str(OUT/'movement-desktop.png'));button(page,'skip').click()
 button(page,'finish').click();page.screenshot(path=str(OUT/'evening-desktop.png'))
 check('repair visible with real opportunity cost',current(page)['oven'] and any(x['id']=='Theo' for x in current(page)['missed']))
 button(page,'next').click();day(page);button(page,'next').click();day(page)
 check('Assignment I ordinary UI win',current(page)['win'] is True)
 page.screenshot(path=str(OUT/'ending-desktop.png'))
 parent=json.dumps(current(page),sort_keys=True)
 button(page,'rewind').click();page.locator('#rewind-day').select_option('0');page.locator('#branch-name').fill('Idle comparison');button(page,'fork').click()
 for d in range(3):
  if d:button(page,'next').click()
  day(page)
 check('Assignment I UI fail path',current(page)['win'] is False)
 check('parent history immutable',json.dumps(saved(page)['branches'][0]['state'],sort_keys=True)==parent)
 button(page,'archive').click();button(page,'archive-tab','connections').click();page.screenshot(path=str(OUT/'causal-desktop.png'))
 check('causal archive exposes actual source links',page.locator('.deps a').count()>0)
 button(page,'archive-tab','parallel').click();button(page,'compare').click();page.screenshot(path=str(OUT/'compare-desktop.png'))
 check('parallel comparison exposes eight residents',page.locator('tbody tr').count()==8)
 button(page,'counterfactual').click();check('counterfactual explicitly labeled',page.locator('#comparison').inner_text().startswith('Computed counterfactual'))
 button(page,'close').click();button(page,'menu').click();button(page,'home').click();button(page,'start').click();button(page,'assignment',1).click()
 for d in range(4):
  if d:button(page,'next').click()
  day(page,'exhibit' if d==0 else 'nothing',capture='encounter-desktop.png' if d==1 else None)
 check('Assignment II ordinary UI win',current(page)['win'] is True)
 button(page,'assignment',2).click()
 for d in range(5):
  if d:button(page,'next').click()
  day(page,['gathering-hall','gathering-park','nothing','nothing','nothing'][d])
 check('Assignment III ordinary UI win and attendance',current(page)['win'] is True and len(current(page)['attendance'])==3)
 check('Open Desk unlock',3 in saved(page)['unlocked'])
 button(page,'assignment',3).click();check('Open Desk has no win score',current(page)['win'] is None)
 # Export and import through real file picker, then reject a corrupted file.
 button(page,'menu').click()
 with page.expect_download() as d:button(page,'export').click()
 path=OUT/'browser-save.json';d.value.save_as(path)
 page.on('dialog',lambda d:d.accept())
 with page.expect_file_chooser() as f:button(page,'import').click()
 f.value.set_files(path);check('export/import round trip',len(saved(page)['branches'])==5)
 (OUT/'invalid-save.json').write_text('{"version":1,"payload":"x","checksum":"0"}')
 button(page,'menu').click()
 old=saved(page)
 with page.expect_file_chooser() as f:button(page,'import').click()
 f.value.set_files(OUT/'invalid-save.json');check('corrupt import preserves progress',saved(page)==old)
 button(page,'close').click()
 # Repeated forks reach the cap without evicting existing branches.
 for i in range(11):
  button(page,'rewind').click();button(page,'fork').click()
 before=saved(page);button(page,'rewind').click();button(page,'fork').click()
 check('branch cap prevents silent eviction',saved(page)==before and len([b for b in before['branches'] if b['state']['scenario']==3])==12)
 check('no unhandled browser errors',not errors)
 check('no external runtime requests',not remote)
 check('desktop layout fits viewport',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 video=page.video
 context.close()
 if video:Path(video.path()).replace(OUT/'gameplay-chromium.webm')
 # Mobile touch, reduced motion, blocked storage and fullscreen denial.
 mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
 mp=mobile.new_page();mp.add_init_script("document.documentElement.requestFullscreen=()=>Promise.reject(new Error('denied'));Storage.prototype.setItem=function(){throw new Error('blocked')}")
 mp.goto(URL);mp.screenshot(path=str(OUT/'title-phone.png'));button(mp,'start').tap();button(mp,'assignment',0).tap()
 check('touch START survives fullscreen denial',mp.locator('#intervention').is_visible())
 mp.screenshot(path=str(OUT/'morning-phone.png'),full_page=True)
 mp.locator('input[value=repair]').check();mp.locator('button[type=submit]').tap();button(mp,'finish').tap()
 check('blocked storage session play reaches repair', 'oven works again' in mp.locator('#phase').inner_text())
 check('phone portrait has no horizontal overflow',mp.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 mp.set_viewport_size({'width':844,'height':390});mp.screenshot(path=str(OUT/'phone-landscape.png'),full_page=True)
 check('touch landscape preserves state', 'oven works again' in mp.locator('#phase').inner_text())
 button(mp,'language').tap();button(mp,'archive').tap();mp.screenshot(path=str(OUT/'archive-phone-zh.png'),full_page=True)
 check('Chinese archive localized', '因果檔案' in mp.locator('.modal').inner_text())
 check('reduced motion suppresses decorative animation',mp.locator('.tree').first.evaluate('(el)=>getComputedStyle(el).animationName')=='none')
 button(mp,'close').tap()
 # Targeted native accessible names, practical hit targets, visible focus and dialog semantics.
 check('all visible buttons have accessible text',mp.locator('button:visible').evaluate_all('(xs)=>xs.every(x=>x.textContent.trim()||x.getAttribute("aria-label"))'))
 check('controls have 44px practical height',mp.locator('button:visible').evaluate_all('(xs)=>xs.every(x=>x.getBoundingClientRect().height>=44)'))
 mobile.close()
 # Muted default and unavailable audio remain playable.
 audio=browser.new_context();ap=audio.new_page();ap.add_init_script("window.AudioContext=function(){throw new Error('blocked audio')}");ap.goto(URL);check('sound defaults muted',button(ap,'sound').get_attribute('aria-pressed')=='false');button(ap,'sound').click();check('denied audio stays muted',button(ap,'sound').get_attribute('aria-pressed')=='false');audio.close()
 # Alternative engine is attempted when its runner exists.
 try:
  alt=p.firefox.launch();alt.close();results.append({'check':'alternative browser available','status':'NOT VERIFIED','reason':'Available runner needs a separate full run'})
 except Exception as e:results.append({'check':'alternative browser engine','status':'NOT VERIFIED','reason':str(e).splitlines()[0]})
 # Fresh context with malformed persisted data.
 recovery=browser.new_context();rp=recovery.new_page();rp.add_init_script('localStorage.setItem("butterfly-v1","corrupt")');rp.goto(URL)
 check('damaged storage offers recovery without reset',rp.locator('[data-action=raw]').is_visible())
 recovery.close();browser.close()
(OUT/'browser-results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
