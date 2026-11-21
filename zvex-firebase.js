/* zVex Firebase integration. Fill config from Firebase Console > Project settings > Your apps. */
const ZVEX_CONFIG = {
  apiKey: 'AIzaSyBt7fEl3IHPH1pOfkMTGCCRyLzxMvO4AHQ',
  authDomain: 'zvex-cd442.firebaseapp.com',
  databaseURL: 'https://zvex-cd442-default-rtdb.firebaseio.com',
  projectId: 'zvex-cd442',
  appId: '1:350501993756:web:07c04d61a713e946144ed9'
};
// Only the Firebase Auth account with this verified email is Owner.
const OWNER_EMAIL = 'timithyandtimithy30@gmail.com';
const ZVEX_TUTORIAL_VIDEO_ID = ''; // YouTube video ID for your actual tutorial; leave empty to disable video activity

const $z = id => document.getElementById(id);
const zx = {user:null,auth:null,db:null,active:null,challenge:null,profile:null,cloud:null};
const zxEsc = s => String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const zxMsg = s => { $z('authStatus').textContent=s; };
function zxAuthError(e){
 const code=e?.code||'';
 const messages={
  'auth/email-already-in-use':'This email already has an account. Click Sign in instead.',
  'auth/invalid-email':'Enter a valid email address.',
  'auth/weak-password':'Choose a password with at least 6 characters.',
  'auth/operation-not-allowed':'Firebase Email/Password is disabled. Enable it in Authentication > Sign-in method.',
  'auth/unauthorized-domain':'This website domain is not authorized in Firebase Authentication settings.',
  'auth/invalid-api-key':'Invalid Firebase API key. Check zvex-firebase.js.',
  'auth/network-request-failed':'Firebase network error. Check your internet connection and browser blockers.',
  'auth/invalid-credential':'Invalid email or password.',
  'auth/too-many-requests':'Too many attempts. Try again later.'
 };
 return (messages[code]||e?.message||'Account request failed.')+(code?' ['+code+']':'');
}
function zxCheckAuthFields(){
 const email=$z('authEmail').value.trim(),password=$z('authPassword').value;
 if(!email||!email.includes('@'))throw Error('Enter a valid email address.');
 if(password.length<6)throw Error('Password must contain at least 6 characters.');
 return {email,password};
}

const zxIsOwner = () => Boolean(zx.user && zx.user.emailVerified && zx.user.email && zx.user.email.toLowerCase()===OWNER_EMAIL);
const zxNeed = () => {if(!zx.user) {showToast('Sign in first');location.hash='account';return false;}return true;};
const zxRandom = (min,max) => {const v=new Uint32Array(1);crypto.getRandomValues(v);return min+(v[0]%(max-min+1));};
const zxShuffle = list => {let a=[...list];for(let i=a.length-1;i>0;i--){let j=zxRandom(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
const zxToday = () => new Date().toISOString().slice(0,10);
const zxActivities = [
  {id:'survey',title:'Customer Survey',desc:'Answer 12 detailed preference questions',cents:35,kind:'survey'},
  {id:'video',title:'Watch & Answer',desc:'Watch a tutorial and pass a comprehension quiz',cents:25,kind:'quiz'},
  {id:'reading',title:'Read & Answer',desc:'Read a digital safety guide and pass its quiz',cents:30,kind:'quiz'},
  {id:'hunt',title:'Website Scavenger Hunt',desc:'Find clues hidden in the store',cents:25,kind:'quiz'},
  {id:'feedback',title:'Detailed Product Feedback',desc:'Provide specific, actionable product feedback',cents:45,kind:'feedback'}
];
const zxQuestionBank = {
 reading:[
 ['Why is reusing a password risky?',['A breach elsewhere may expose the same password','It makes websites load slower','It hides your username'],0],
 ['What should you do with a license key?',['Post it publicly','Keep it private','Put it in comments'],1],
 ['What is a phishing message?',['A fake message trying to collect sensitive data','An official update from your browser','A game setting'],0],
 ['What does two-step verification add?',['A second login check','More browser themes','A faster internet connection'],0],
 ['Which is a safer download source?',['An unknown DM link','An official developer page','A random shortened URL'],1],
 ['Why should you keep software updated?',['To fix security weaknesses','To increase file sizes','To erase your files'],0],
 ['What should a suspicious login alert prompt?',['Ignore it forever','Check your account through the official site','Send your password to the sender'],1],
 ['What does a public review reveal?',['Any information you put in it','Your password automatically','Your bank details automatically'],0]
 ],
 video:[
 ['What is virtual USD on zVex?',['Real transferable cash','Fictional store credits','Cryptocurrency'],1],
 ['Where can you check a product after unlocking it?',['Your wallet','A random external site','Someone else’s account'],0],
 ['Should you share a private license key publicly?',['Yes','No','Only on social media'],1],
 ['How do creator applications get approved?',['Automatically for every applicant','After Owner review','By entering a famous name'],1],
 ['Does a completed activity instantly guarantee a reward?',['No, a reviewer verifies it','Yes, regardless of answers','Only if you are famous'],0],
 ['Where is the official product description?',['Products','A stranger’s DM','An unrelated website'],0],
 ['What happens when you regenerate a browser-only key?',['The saved display key changes','Every old copy is magically revoked','You receive real money'],0]
 ],
 hunt:[
 ['Which navigation section contains zVex license delivery?',['Wallet & codes','Reviews only','About only'],0],
 ['Which page lets you browse items?',['Products','Owner panel','Sign out'],0],
 ['Where is the customer feedback form?',['Reviews','The browser address bar','Account password input'],0],
 ['What is the demo promo code shown in the wallet?',['VEXFREE','PASSWORD','OWNER'],0],
 ['Where can you apply to become a verified creator?',['Creators','Cart quantity','Website footer only'],0],
 ['What does the cart show before a purchase?',['Subtotal','YouTube subscribers','Weather'],0],
 ['What section shows your daily earnings requests?',['Earn USD','Hero banner','Copyright line'],0]
 ]
};
const zxArticle = `<div class="zx-panel"><h3>Digital Account Safety</h3><p>Choose a unique password for each service, enable two-step verification when available, and never share passwords or license keys publicly. Phishing messages imitate trusted websites to trick people into revealing sensitive information. For security notices, open the provider's official website rather than a link in an unexpected message.</p><p>Software updates can fix security weaknesses. Download tools from official sources and review permissions before installing. Product reviews and creator applications should contain only information you intend to make public.</p></div>`;
const zxSurvey = [
 ['Which website section do you visit most?',['Products','Wallet','Earn','Reviews']],
 ['Which format helps you learn fastest?',['Video','Written guide','Images','Practice']],
 ['Which store feature needs improvement?',['Search','Cart','License delivery','Rewards']],
 ['Which product detail matters most?',['Screenshots','Description','Updates','Support']],
 ['How often would you use the store?',['Daily','Weekly','Monthly','Rarely']],
 ['Which device do you use for browsing?',['Desktop','Laptop','Phone','Tablet']],
 ['What makes a review helpful?',['Details','Photos','Scores','Comparisons']],
 ['How should a help guide be organized?',['Short steps','Full article','FAQ','Video']],
 ['Which theme do you prefer?',['Dark','Light','System','High contrast']],
 ['Which navigation change would help?',['Fewer tabs','Search bar','Larger buttons','No change']],
 ['Which rewards are most useful?',['Surveys','Quizzes','Feedback','Scavenger hunts']],
 ['What makes you trust a product description?',['Clear features','Known creator','Demo screenshots','Update history']],
 ['What would improve account access?',['Better labels','Easier password reset','Better mobile layout','More guidance']],
 ['How should receipts be delivered?',['Wallet page','Email','Both','Download file']]
];
function zxRenderActivities(){ $z('earnCards').innerHTML=zxActivities.map(a=>`<div class="zx-task"><h3>${zxEsc(a.title)}</h3><p class="zx-muted">${zxEsc(a.desc)}</p><p><strong>+$${(a.cents/100).toFixed(2)} virtual USD</strong></p><button class="zx-action" data-start="${a.id}">Start activity</button></div>`).join('');
 $z('earnCards').querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>zxStart(b.dataset.start)); }
function zxStart(id){if(!zxNeed())return;if(id==='video'&&!ZVEX_TUTORIAL_VIDEO_ID){showToast('Owner must configure a tutorial video first');return;}const a=zxActivities.find(x=>x.id===id);const panel=$z('activityPanel');panel.classList.remove('zx-hidden');$z('activityTitle').textContent=a.title;$z('activityStatus').textContent='';zx.active={...a,answers:[],checks:[]};
 let html='';if(id==='feedback')html=`<p class="zx-muted">Write meaningful feedback about your actual experience. Generic one-word answers will be rejected.</p><label>What feature did you test?<input class="zx-input" id="fbFeature" maxlength="140" required/></label><label>What worked well?<textarea class="zx-input" id="fbGood" minlength="40" rows="3"></textarea></label><label>What should change and why?<textarea class="zx-input" id="fbImprove" minlength="80" rows="5"></textarea></label><label>How can we reproduce a problem or test your suggestion?<textarea class="zx-input" id="fbSteps" minlength="60" rows="4"></textarea></label>`;
 else if(id==='survey'){
  const picked=zxShuffle(zxSurvey).slice(0,12);zx.active.checks=picked.map(q=>q[0]);html=picked.map((q,i)=>`<fieldset class="zx-task"><legend>${i+1}. ${zxEsc(q[0])}</legend>${zxShuffle(q[1]).map(opt=>`<label class="zx-answer"><input type="radio" name="zxQ${i}" value="${zxEsc(opt)}"> ${zxEsc(opt)}</label>`).join('')}</fieldset>`).join('');
 }else{
  const picked=zxShuffle(zxQuestionBank[id]).slice(0,5);zx.active.checks=picked.map(q=>({question:q[0],correct:q[1][q[2]]}));
  if(id==='video')html+=`<div class="zx-panel"><strong>Watch the zVex tutorial</strong><iframe title="zVex tutorial" width="100%" height="240" style="border:0;border-radius:12px;margin-top:10px" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(ZVEX_TUTORIAL_VIDEO_ID)}" allowfullscreen></iframe><p class="zx-muted">Watch the video before answering.</p></div>`;
  if(id==='reading')html+=zxArticle;
  if(id==='hunt')html+='<p class="zx-muted">Explore the live site tabs to find the answers, then return to this challenge.</p>';
  html+=picked.map((q,i)=>`<fieldset class="zx-task"><legend>${i+1}. ${zxEsc(q[0])}</legend>${zxShuffle(q[1]).map(opt=>`<label class="zx-answer"><input type="radio" name="zxQ${i}" value="${zxEsc(opt)}"> ${zxEsc(opt)}</label>`).join('')}</fieldset>`).join('');
 }
 $z('activityBody').innerHTML=html;panel.scrollIntoView({behavior:'smooth',block:'start'});
}
function zxGather(){const a=zx.active;if(!a)return null;if(a.id==='feedback'){const ids=['fbFeature','fbGood','fbImprove','fbSteps'];let vals=ids.map(id=>$z(id).value.trim());if(vals[0].length<4||vals[1].length<40||vals[2].length<80||vals[3].length<60)throw Error('Please complete every feedback field with enough detail.');return {responses:vals};}
 const answers=a.checks.map((_,i)=>{const chosen=document.querySelector(`input[name="zxQ${i}"]:checked`);if(!chosen)throw Error('Please answer every question.');return chosen.value;});
 if(a.id!=='survey'){const correct=answers.filter((v,i)=>v===a.checks[i].correct).length;if(correct<4)throw Error(`Score ${correct}/5. You need at least 4 correct; try another randomized attempt.`);return {score:correct,questions:a.checks.map(c=>c.question)};}
 return {questions:a.checks,responses:answers}; }
async function zxSubmit(){if(!zxNeed()||!zx.active)return;try{const details=zxGather();const a=zx.active;const day=zxToday();const check=await zx.db.ref(`rewardDays/${zx.user.uid}/${a.id}/${day}`).once('value');if(check.exists())throw Error('You already submitted this activity today.');
 // Security rules allow one submission per activity per UTC day. Owner reviews then credits the wallet.
 await zx.db.ref(`rewardDays/${zx.user.uid}/${a.id}/${day}`).set({activity:a.id,cents:a.cents,details,status:'pending',createdAt:firebase.database.ServerValue.TIMESTAMP});
 $z('activityStatus').textContent='Submitted for Owner review. No money has been credited yet.';showToast('Activity submitted for review');zxLoadMine();
 }catch(e){$z('activityStatus').textContent=e.message;}}
const zxRead = async path => (await zx.db.ref(path).once('value')).val();
async function zxLoadMine(){if(!zx.user)return;try{const obj=await zxRead(`rewardDays/${zx.user.uid}`)||{};const all=Object.values(obj).flatMap(v=>Object.values(v)).filter(x=>x&&x.activity);$z('mySubmissions').innerHTML=all.length?all.map(t=>`<div class="history-row"><span>${zxEsc(t.activity)} · ${zxEsc(t.status)}</span><strong>+$${(t.cents/100).toFixed(2)}</strong></div>`).join(''):'No submissions yet.';}catch(e){$z('mySubmissions').textContent=e.message;}}
function zxSetCloud(data){zx.cloud=data||{balance:0,owned:false,redeemed:false}; wallet.balance=zx.cloud.balance||0; wallet.owned=zx.cloud.owned?['lua-pack']:[];wallet.redeemed=zx.cloud.redeemed?['VEXFREE']:[];renderWallet();renderCart();showLicense();}
async function zxInitWallet(){if(zx.cloudPath)zx.db.ref(zx.cloudPath).off();const path=`wallets/${zx.user.uid}`;zx.cloudPath=path;await zx.db.ref(path).transaction(cur=>cur===null?{balance:0,owned:false,redeemed:false}:undefined,undefined,false);zx.db.ref(path).on('value',snapshot=>zxSetCloud(snapshot.val()));}
async function zxInit(){zxRenderActivities();$z('closeActivity').onclick=()=>$z('activityPanel').classList.add('zx-hidden');$z('submitActivity').onclick=zxSubmit;
 if(ZVEX_CONFIG.apiKey.startsWith('REPLACE_')||ZVEX_CONFIG.authDomain.startsWith('REPLACE_')){
  zxMsg('SETUP REQUIRED: Firebase API key and Auth domain are missing. Open zvex-firebase.js and paste the Firebase web app config from Project settings > Your apps. Then enable Authentication > Sign-in method > Email/Password.');
  return;
 }
 if(typeof firebase==='undefined'){zxMsg('Firebase scripts could not load. Check your connection or browser blocker.');return;}
 try{firebase.initializeApp(ZVEX_CONFIG);zx.auth=firebase.auth();zx.db=firebase.database();zxMsg('Ready. Sign in or create an account.');
 zx.auth.onAuthStateChanged(async u=>{if(u){try{await u.reload();await u.getIdToken(true);}catch(e){console.warn('Could not refresh email verification:',e.message);}} zx.user=u;$z('authFields').classList.toggle('zx-hidden',!!u);$z('authLogged').classList.toggle('zx-hidden',!u);$z('accountNav').textContent=u?'Account':'Sign in';$z('ownerPanel').classList.toggle('zx-hidden',!zxIsOwner());$z('ownerNav').classList.toggle('zx-hidden',!zxIsOwner());
  if(!u){if(zx.cloudPath){zx.db.ref(zx.cloudPath).off();zx.cloudPath=null;}wallet.balance=0;wallet.owned=[];wallet.redeemed=[];renderWallet();renderCart();showLicense();zxMsg('Sign in to submit activities and creator applications.');$z('creatorResult').textContent='';$z('verifiedBadge').classList.add('zx-hidden');$z('sendVerifyBtn').classList.add('zx-hidden');return;}
  $z('loggedEmail').textContent=u.email||u.uid;zxMsg('Signed in as '+(u.email||u.uid)+(u.emailVerified?' · Email verified':' · Email NOT verified. Click Send verification email, then refresh and sign in again.'));
  $z('sendVerifyBtn').classList.toggle('zx-hidden',Boolean(u.emailVerified));
  try{await zxInitWallet();await zxLoadMine();const app=await zxRead(`applications/${u.uid}`);zxShowApplication(app);if(zxIsOwner())await zxLoadOwner();}catch(e){zxMsg('Firebase permission/configuration error: '+e.message);}
 });
 }catch(e){zxMsg('Firebase initialization failed: '+e.message);}}
$z('signinBtn').onclick=async()=>{
 if(!zx.auth){zxMsg('Firebase is not configured yet. See setup instructions above.');return;}
 try{const {email,password}=zxCheckAuthFields();zxMsg('Signing in...');await zx.auth.signInWithEmailAndPassword(email,password)}
 catch(e){zxMsg(zxAuthError(e));}
};
$z('signupBtn').onclick=async()=>{
 if(!zx.auth){zxMsg('Firebase is not configured yet. See setup instructions above.');return;}
 const btn=$z('signupBtn');btn.disabled=true;
 try{
  const {email,password}=zxCheckAuthFields();zxMsg('Creating account...');
  const cred=await zx.auth.createUserWithEmailAndPassword(email,password);
  try{await cred.user.sendEmailVerification();zxMsg('Account created! Verification email sent to '+email+'. Check spam if necessary.');}
  catch(mailError){zxMsg('Account created, but verification email failed: '+zxAuthError(mailError));}
 }catch(e){zxMsg(zxAuthError(e));}
 finally{btn.disabled=false;}
};
$z('sendVerifyBtn').onclick=async()=>{
 if(!zx.auth?.currentUser)return;
 try{await zx.auth.currentUser.sendEmailVerification();zxMsg('Verification email sent. Check your inbox and spam folder.');}
 catch(e){zxMsg(zxAuthError(e));}
};
$z('signoutBtn').onclick=async()=>{await zx.auth.signOut();location.hash='account'};
function zxChallenge(){const bytes=new Uint8Array(9);crypto.getRandomValues(bytes);return 'ZVEX-'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();}
function zxShowApplication(app){if(!app){$z('creatorResult').textContent='No application submitted yet.';$z('creatorForm').classList.remove('zx-hidden');$z('verifiedBadge').classList.add('zx-hidden');return;}
 $z('creatorForm').classList.add('zx-hidden');$z('verifiedBadge').classList.toggle('zx-hidden',app.status!=='accepted');
 $z('creatorResult').innerHTML=`<strong>Application: ${zxEsc(app.status)}</strong><br>Verification phrase: <code>${zxEsc(app.challenge)}</code><p>Put this exact phrase in your YouTube channel's public description, then allow the Owner to review it. Remove it after approval if desired.</p><p>Channel: <a href="${zxEsc(app.channelUrl)}" target="_blank" rel="noopener noreferrer">${zxEsc(app.channelName)}</a></p>${app.status==='accepted'?'<strong>✓ Verified zVex Creator — $1.00/day virtual USD, credited by Owner payout processing.</strong>':''}`;}
$z('creatorForm').onsubmit=async e=>{e.preventDefault();if(!zxNeed())return;try{const u=new URL($z('creatorUrl').value.trim());if(!['www.youtube.com','youtube.com','m.youtube.com'].includes(u.hostname)||u.protocol!=='https:')throw Error('Use a public YouTube channel URL.');const video=new URL($z('creatorVideo').value.trim());if(!['www.youtube.com','youtube.com','youtu.be','m.youtube.com'].includes(video.hostname))throw Error('Use a YouTube video URL.');
 const app={uid:zx.user.uid,channelUrl:u.href,channelName:$z('creatorName').value.trim(),subscribers:Number($z('creatorSubscribers').value),experience:$z('creatorAge').value,content:$z('creatorContent').value.trim(),why:$z('creatorWhy').value.trim(),plan:$z('creatorPlan').value.trim(),video:video.href,challenge:zxChallenge(),status:'pending',createdAt:firebase.database.ServerValue.TIMESTAMP};
 if(app.content.length<40||app.why.length<60||app.plan.length<40)throw Error('Answer the application questions in detail.');
 await zx.db.ref(`applications/${zx.user.uid}`).set(app);zxShowApplication({...app,createdAt:Date.now()});showToast('Creator application submitted.');}catch(err){$z('creatorResult').textContent=err.message;}}
async function zxLoadOwner(){if(!zxIsOwner())return;try{const apps=await zxRead('applications')||{};let html='';for(const [uid,a] of Object.entries(apps)){
 html+=`<div class="zx-task"><strong>${zxEsc(a.channelName)}</strong> <span class="zx-muted">(${zxEsc(a.status)})</span><p class="zx-muted">Channel: <a target="_blank" rel="noopener noreferrer" href="${zxEsc(a.channelUrl)}">${zxEsc(a.channelUrl)}</a><br>Challenge: <code>${zxEsc(a.challenge)}</code><br>Subscribers (self-reported): ${zxEsc(a.subscribers)}<br>Experience: ${zxEsc(a.experience)}<br>Content: ${zxEsc(a.content)}<br>Why: ${zxEsc(a.why)}<br>Plan: ${zxEsc(a.plan)}<br>Video: <a target="_blank" rel="noopener noreferrer" href="${zxEsc(a.video)}">${zxEsc(a.video)}</a></p><button class="zx-action" data-app="${zxEsc(uid)}" data-status="accepted">Accept after checking channel phrase</button> <button class="zx-action zx-secondary" data-app="${zxEsc(uid)}" data-status="rejected">Reject</button></div>`;}
 $z('ownerApplications').innerHTML=html||'<p class="zx-muted">No applications.</p>';
 $z('ownerApplications').querySelectorAll('[data-app]').forEach(b=>b.onclick=()=>zxSetApp(b.dataset.app,b.dataset.status));
 const rewards=await zxRead('rewardDays')||{};let rows='';for(const [uid,tasks] of Object.entries(rewards))for(const [kind,days] of Object.entries(tasks))for(const [day,info] of Object.entries(days))if(info.status==='pending'){
 rows+=`<div class="zx-task"><strong>${zxEsc(kind)}</strong> ${zxEsc(day)} · UID ${zxEsc(uid)}<p class="zx-muted">${zxEsc(JSON.stringify(info.details))}</p><button class="zx-action" data-credit="${zxEsc(uid)}|${zxEsc(kind)}|${zxEsc(day)}">Approve +$${(info.cents/100).toFixed(2)}</button> <button class="zx-action zx-secondary" data-deny="${zxEsc(uid)}|${zxEsc(kind)}|${zxEsc(day)}">Reject</button></div>`;}
 $z('ownerRewards').innerHTML=rows||'<p class="zx-muted">No pending reward submissions.</p>';
 $z('ownerRewards').querySelectorAll('[data-credit]').forEach(b=>b.onclick=()=>zxApproveReward(...b.dataset.credit.split('|'),true));
 $z('ownerRewards').querySelectorAll('[data-deny]').forEach(b=>b.onclick=()=>zxApproveReward(...b.dataset.deny.split('|'),false));
 }catch(e){$z('ownerApplications').textContent=e.message;}}
async function zxSetApp(uid,status){if(!zxIsOwner())return;if(status==='accepted'&&!confirm('Did you personally check the exact verification phrase in the PUBLIC channel description?'))return;
 try{const path=zx.db.ref(`applications/${uid}`);await path.update({status,reviewedAt:firebase.database.ServerValue.TIMESTAMP,acceptedDay:status==='accepted'?zxToday():null});showToast('Application '+status);zxLoadOwner();}catch(e){alert(e.message)}}
async function zxCredit(uid,cents){
 if(!zxIsOwner())throw Error('Owner account must have a verified email to credit wallets.');
 if(!Number.isSafeInteger(cents)||cents<=0||cents>100)throw Error('Invalid reward amount.');
 // Firebase transactions often first call the updater with null before loading remote data.
 // Returning undefined there aborts the transaction, even if a wallet exists on the server.
 const ref=zx.db.ref(`wallets/${uid}`);
 let result;
 try{
  result=await ref.transaction(cur=>{
   const wallet=cur===null?{balance:0,owned:false,redeemed:false}:cur;
   const balance=Number(wallet.balance);
   if(!Number.isSafeInteger(balance)||balance<0||balance+cents>100000000)return;
   return {...wallet,balance:balance+cents};
  },undefined,false);
 }catch(error){console.error('zVex wallet credit failed:',error);throw Error('Firebase rejected wallet credit: '+(error.message||error.code||error));}
 if(!result.committed)throw Error('Wallet credit canceled. Check the account wallet and published Firebase rules.');
 return result.snapshot.val();
}
async function zxApproveReward(uid,kind,day,approve){if(!zxIsOwner())return;const ref=zx.db.ref(`rewardDays/${uid}/${kind}/${day}`);try{const s=await ref.once('value');const item=s.val();if(!item||item.status!=='pending')return;
 if(approve){await ref.update({status:'processing'});try{await zxCredit(uid,item.cents);await ref.update({status:'approved',reviewedAt:firebase.database.ServerValue.TIMESTAMP});}catch(e){await ref.update({status:'pending'});throw e;}}
 else await ref.update({status:'rejected',reviewedAt:firebase.database.ServerValue.TIMESTAMP});showToast('Submission processed');zxLoadOwner();}catch(e){alert(e.message);}}
$z('refreshOwner').onclick=zxLoadOwner;
async function zxPayCreator(uid,app){
 const walletRef=zx.db.ref(`wallets/${uid}`),today=zxToday();
 const result=await walletRef.transaction(cur=>{
   const wallet=cur===null?{balance:0,owned:false,redeemed:false}:cur;
   const accepted=app.acceptedDay;
   if(!accepted||accepted>today)return;
   const from=wallet.lastCreatorPaidDay && wallet.lastCreatorPaidDay>=accepted?wallet.lastCreatorPaidDay:accepted;
   const start=new Date(from+'T00:00:00Z');
   if(wallet.lastCreatorPaidDay && wallet.lastCreatorPaidDay>=accepted)start.setUTCDate(start.getUTCDate()+1);
   const end=new Date(today+'T00:00:00Z');
   if(start>end)return;
   const days=Math.floor((end-start)/86400000)+1;
   const due=Math.min(days,90);
   const last=new Date(start.getTime()+(due-1)*86400000).toISOString().slice(0,10);
   if(!Number.isSafeInteger(wallet.balance)||wallet.balance<0||wallet.balance+due*100>100000000)return;
   return {...wallet,balance:wallet.balance+due*100,lastCreatorPaidDay:last};
 });
 return result.committed;
}
$z('runDailyPayouts').onclick=async()=>{if(!zxIsOwner())return;const status=$z('dailyStatus');status.textContent='Processing...';let credited=0;
 try{const apps=await zxRead('applications')||{};for(const [uid,app] of Object.entries(apps))if(app.status==='accepted' && await zxPayCreator(uid,app))credited++;
 status.textContent=`Processed ${credited} creator wallet(s). Each wallet credits eligible days once.`;
 }catch(e){status.textContent=e.message;}};
// Replace existing local/demo reward and purchasing handlers with cloud-aware handlers when signed in.
// Capture clicks before original listeners; use cloud transactions for synchronized accounts.
$z('promoForm').addEventListener('submit',async e=>{e.preventDefault();e.stopImmediatePropagation();if(!zx.user){showToast('Sign in to redeem credits');location.hash='account';return;}const code=$z('promoInput').value.trim().toUpperCase();if(code!=='VEXFREE'){showToast('Invalid code');return;}
 try{const result=await zx.db.ref(`wallets/${zx.user.uid}`).transaction(cur=>{if(!cur||cur.redeemed)return;return {...cur,balance:cur.balance+200,redeemed:true};});showToast(result.committed?'VEXFREE redeemed!':'Already redeemed');}catch(err){showToast(err.message);}},true);
$z('purchaseVx').addEventListener('click',async e=>{e.preventDefault();e.stopImmediatePropagation();if(!zx.user){showToast('Sign in to make a cloud purchase');location.hash='account';return;}try{const result=await zx.db.ref(`wallets/${zx.user.uid}`).transaction(cur=>{if(!cur||cur.owned||cur.balance<200)return;return {...cur,balance:cur.balance-200,owned:true};});if(result.committed){quantity=0;saveCart();closeCart();showToast('Unlocked! See wallet for your license key.');location.hash='wallet';}else showToast('Already owned or not enough virtual USD');}catch(err){showToast(err.message);}},true);
// The old browser-only purchase flow remains usable when signed out, but requires sign-in for cloud rewards.
zxInit();
