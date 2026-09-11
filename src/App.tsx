import {FormEvent,useEffect,useMemo,useState} from 'react';
import {createClient,Session} from '@supabase/supabase-js';
import {
  Activity,ArrowLeft,ArrowUpRight,BookOpen,Boxes,BriefcaseBusiness,CheckCircle2,
  ClipboardCheck,FileCheck2,Home,Inbox,Landmark,Layers3,LogOut,Megaphone,Menu,
  MessageSquareText,Moon,Plus,RefreshCw,Search,Settings,ShieldCheck,Sparkles,Sun,
  TrendingUp,Users,WalletCards,Workflow,XCircle
} from 'lucide-react';

const supabaseUrl=import.meta.env.VITE_SUPABASE_URL||'';
const supabaseKey=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY||'';
const supabase=supabaseUrl&&supabaseKey?createClient(supabaseUrl,supabaseKey):null;
const CEO_BASE='https://master-ceo-dashboard.vercel.app';

type View='home'|'launch'|'active'|'review'|'returned';
type Membership={organization_id:string;role:string;status:string};
type JobStatus='requested'|'working'|'review'|'returned'|'rejected'|'failed';
type ReviewState='pending'|'approved'|'rejected'|'changes_requested';
type Job={
  id:string;
  organization_id:string;
  source_system:string;
  source_workspace:string;
  return_workspace:string;
  requested_by:string;
  title:string;
  request_payload:{instructions?:string;system_key?:string;system_name?:string}|null;
  assigned_agent?:string|null;
  orchestration_command_id?:string|null;
  status:JobStatus;
  result_reference?:{summary?:string;url?:string}|null;
  review_state:ReviewState;
  reviewed_by?:string|null;
  reviewed_at?:string|null;
  created_at:string;
  updated_at:string;
};
type SystemTarget={key:string;name:string;description:string;agent:string;url:string};
type ModuleLink={name:string;href:string;icon:React.ReactNode};

const systems:SystemTarget[]=[
  {key:'visionweaver',name:'VisionWeaver',description:'Images, video, books, movies, storyboards and media production.',agent:'VISIONWEAVER',url:`${CEO_BASE}/systems/visionweaver`},
  {key:'landweaver',name:'LandWeaver',description:'Property intelligence, land research, diligence and market operations.',agent:'LANDWEAVER',url:`${CEO_BASE}/systems/landweaver`},
  {key:'grantos',name:'GrantOS',description:'Grant discovery, requirements, drafting, submission and funding operations.',agent:'GRANTOS',url:`${CEO_BASE}/systems/grantos`},
  {key:'thelma',name:'T.H.E.L.M.A.',description:'Operations dispatch, agent coordination, incidents, review and approvals.',agent:'THELMA',url:`${CEO_BASE}/systems/thelma`},
  {key:'cmgio',name:'CMGIO',description:'Publishing, marketing, growth intelligence and optimization.',agent:'CMGIO',url:`${CEO_BASE}/systems/cmgio-map`},
  {key:'fabric',name:'EC Integration Fabric',description:'Connections, governed execution, retries, authorizations and system health.',agent:'THELMA',url:`${CEO_BASE}/systems/integration-fabric`},
  {key:'ceo',name:'CEO Command Center',description:'Executive oversight, decisions, systems, risk, usage and audit.',agent:'THELMA',url:`${CEO_BASE}/dashboard`}
];

const modules:ModuleLink[]=[
  {name:'Dashboard',href:`${CEO_BASE}/dashboard`,icon:<Home/>},
  {name:'AI Mastery',href:`${CEO_BASE}/modules/ai-mastery`,icon:<BookOpen/>},
  {name:'Agent Hub',href:`${CEO_BASE}/systems/thelma`,icon:<Boxes/>},
  {name:'Leads Pipeline',href:`${CEO_BASE}/modules/leads-pipeline`,icon:<TrendingUp/>},
  {name:'Content Engine',href:`${CEO_BASE}/modules/content-engine`,icon:<Layers3/>},
  {name:'Social Media',href:`${CEO_BASE}/modules/social-media`,icon:<Megaphone/>},
  {name:'Trends',href:`${CEO_BASE}/modules/trends`,icon:<Search/>},
  {name:'Communications',href:`${CEO_BASE}/modules/communications`,icon:<MessageSquareText/>},
  {name:'CRM',href:`${CEO_BASE}/modules/crm`,icon:<Users/>},
  {name:'Finance',href:`${CEO_BASE}/modules/finance`,icon:<WalletCards/>},
  {name:'Products',href:`${CEO_BASE}/modules/products`,icon:<BriefcaseBusiness/>},
  {name:'System Audit',href:`${CEO_BASE}/modules/system-audit`,icon:<ShieldCheck/>},
  {name:'Certificates',href:`${CEO_BASE}/modules/certificates`,icon:<FileCheck2/>},
  {name:'Settings',href:`${CEO_BASE}/modules/settings`,icon:<Settings/>}
];

function viewFromHash(hash:string):View{
  const clean=hash.replace(/^#/,'').replace(/\/$/,'');
  if(clean.endsWith('/launch'))return'launch';
  if(clean.endsWith('/active'))return'active';
  if(clean.endsWith('/review'))return'review';
  if(clean.endsWith('/returned'))return'returned';
  return'home';
}

function hashFor(view:View){
  if(view==='home')return'#/workspace/ceo';
  return`#/workspace/ceo/${view}`;
}

export default function App(){
  const[session,setSession]=useState<Session|null>(null);
  const[membership,setMembership]=useState<Membership|null>(null);
  const[jobs,setJobs]=useState<Job[]>([]);
  const[busy,setBusy]=useState(false);
  const[notice,setNotice]=useState('');
  const[view,setView]=useState<View>(()=>viewFromHash(window.location.hash));
  const[selectedId,setSelectedId]=useState('');
  const[resultText,setResultText]=useState('');
  const[menuOpen,setMenuOpen]=useState(false);
  const[dark,setDark]=useState(()=>localStorage.getItem('desktop-mode')==='dark');
  const[form,setForm]=useState({systemKey:'visionweaver',title:'',instructions:'',returnWorkspace:'Returned Work'});
  const configured=Boolean(supabase);

  useEffect(()=>{
    const sync=()=>{setView(viewFromHash(window.location.hash));setSelectedId('');setMenuOpen(false)};
    window.addEventListener('hashchange',sync);
    if(!window.location.hash)window.history.replaceState(null,'',hashFor('home'));
    return()=>window.removeEventListener('hashchange',sync);
  },[]);

  useEffect(()=>{
    document.documentElement.dataset.theme=dark?'dark':'legal';
    localStorage.setItem('desktop-mode',dark?'dark':'legal');
  },[dark]);

  useEffect(()=>{
    if(!supabase)return;
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const{data}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next));
    return()=>data.subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!session){setMembership(null);setJobs([]);return}
    void loadMembership();
  },[session]);

  useEffect(()=>{if(membership)void loadJobs()},[membership]);

  useEffect(()=>{
    if(!supabase||!membership)return;
    const channel=supabase.channel(`desktop-${membership.organization_id}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'workspace_jobs',filter:`organization_id=eq.${membership.organization_id}`},()=>{void loadJobs()})
      .subscribe();
    return()=>{void supabase.removeChannel(channel)};
  },[membership]);

  const selected=jobs.find(job=>job.id===selectedId)||null;
  useEffect(()=>setResultText(selected?.result_reference?.summary||''),[selectedId,selected?.result_reference?.summary]);

  function navigate(next:View){window.location.hash=hashFor(next)}

  async function loadMembership(){
    if(!supabase||!session)return;
    setBusy(true);
    const{data,error}=await supabase.from('ceo_organization_memberships')
      .select('organization_id,role,status')
      .eq('user_id',session.user.id)
      .eq('status','active')
      .limit(1)
      .maybeSingle();
    setBusy(false);
    if(error)setNotice(error.message);
    setMembership(data||null);
  }

  async function loadJobs(){
    if(!supabase||!membership)return;
    setBusy(true);
    const{data,error}=await supabase.from('workspace_jobs')
      .select('*')
      .eq('organization_id',membership.organization_id)
      .order('created_at',{ascending:false});
    setBusy(false);
    if(error){setNotice(error.message);return}
    const list=(data||[]) as Job[];
    setJobs(list);
    if(selectedId&&!list.some(job=>job.id===selectedId))setSelectedId('');
  }

  async function signIn(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!supabase)return;
    const email=String(new FormData(event.currentTarget).get('email')||'').trim();
    const{error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:`${window.location.origin}/#/workspace/ceo`}});
    setNotice(error?.message||'Secure sign-in link sent.');
  }

  async function recordEvent(job:Job,eventType:string,fromStatus:string|null,toStatus:string|null,note:string,evidence?:Record<string,unknown>){
    if(!supabase||!session)return;
    await supabase.from('workspace_job_events').insert({
      organization_id:job.organization_id,
      job_id:job.id,
      event_type:eventType,
      from_status:fromStatus,
      to_status:toStatus,
      actor_id:session.user.id,
      note,
      evidence:evidence||{}
    });
  }

  async function launchWorkspace(event:FormEvent){
    event.preventDefault();
    if(!supabase||!session||!membership)return;
    const target=systems.find(system=>system.key===form.systemKey);
    if(!target)return;
    setBusy(true);
    setNotice('');
    const{data:job,error:jobError}=await supabase.from('workspace_jobs').insert({
      organization_id:membership.organization_id,
      source_system:'SYS-DESKTOP-001',
      source_workspace:`systems-desktop/${target.key}`,
      return_workspace:form.returnWorkspace.trim()||'Returned Work',
      requested_by:session.user.id,
      title:form.title.trim(),
      request_payload:{instructions:form.instructions.trim(),system_key:target.key,system_name:target.name},
      assigned_agent:target.agent,
      status:'requested',
      review_state:'pending'
    }).select('*').single();

    if(jobError||!job){
      setBusy(false);
      setNotice(jobError?.message||'Could not create workspace request.');
      return;
    }

    await recordEvent(job as Job,'requested',null,'requested','Request launched from Estiban Systems Desktop.',{
      system_key:target.key,
      return_workspace:form.returnWorkspace
    });

    const{data:command,error:commandError}=await supabase.from('orchestration_commands').insert({
      organization_id:membership.organization_id,
      requested_by:session.user.id,
      source_system:'SYS-DESKTOP-001',
      target_agent:target.agent,
      action_type:'workspace_request',
      risk_level:'medium',
      authorization_state:'ASK',
      execution_status:'queued',
      payload_reference:{
        workspace_job_id:job.id,
        system_key:target.key,
        title:form.title.trim(),
        instructions:form.instructions.trim(),
        return_workspace:form.returnWorkspace.trim()||'Returned Work'
      }
    }).select('id').single();

    if(command?.id){
      await supabase.from('workspace_jobs').update({orchestration_command_id:command.id,updated_at:new Date().toISOString()}).eq('id',job.id);
    }

    setBusy(false);
    setForm(current=>({...current,title:'',instructions:''}));
    setSelectedId(job.id);
    await loadJobs();
    navigate('active');
    setNotice(commandError?'Workspace created; orchestration command needs attention.':'Workspace launched and queued for execution.');
  }

  async function transition(job:Job,next:JobStatus,reviewState:ReviewState=job.review_state){
    if(!supabase||!session)return;
    setBusy(true);
    const patch:Record<string,unknown>={status:next,review_state:reviewState,updated_at:new Date().toISOString()};
    if(resultText.trim())patch.result_reference={...(job.result_reference||{}),summary:resultText.trim()};
    if(next==='returned'||next==='rejected'){
      patch.reviewed_by=session.user.id;
      patch.reviewed_at=new Date().toISOString();
    }
    const{error}=await supabase.from('workspace_jobs').update(patch).eq('id',job.id);
    if(!error){
      await recordEvent(job,`status_${next}`,job.status,next,transitionLabel(job.status,next,reviewState),{
        review_state:reviewState,
        result_summary:resultText.trim()||null
      });
    }
    setBusy(false);
    setNotice(error?.message||'Workspace updated.');
    if(!error){
      await loadJobs();
      if(next==='review')navigate('review');
      if(next==='returned'||next==='rejected')navigate('returned');
    }
  }

  const metrics=useMemo(()=>({
    active:jobs.filter(job=>job.status==='requested'||job.status==='working').length,
    review:jobs.filter(job=>job.status==='review').length,
    returned:jobs.filter(job=>job.status==='returned').length,
    exceptions:jobs.filter(job=>job.status==='failed'||job.status==='rejected').length
  }),[jobs]);

  const filtered=useMemo(()=>{
    if(view==='active')return jobs.filter(job=>job.status==='requested'||job.status==='working');
    if(view==='review')return jobs.filter(job=>job.status==='review');
    if(view==='returned')return jobs.filter(job=>['returned','rejected','failed'].includes(job.status));
    return jobs;
  },[jobs,view]);

  if(!configured)return <AuthShell dark={dark} setDark={setDark}><div className="auth-card"><ShieldCheck/><p className="kicker">ESTIBAN CREATIONS</p><h1>Systems Desktop</h1><p>The deployment is missing its Supabase browser connection.</p></div></AuthShell>;

  if(!session)return <AuthShell dark={dark} setDark={setDark}><form className="auth-card" onSubmit={signIn}><Sparkles/><p className="kicker">ESTIBAN CREATIONS</p><h1>Systems Desktop</h1><p>Your operating desk for requesting work, reviewing it, and receiving the finished result.</p><input name="email" type="email" placeholder="Email address" required/><button className="ink-button">Send secure sign-in link</button>{notice&&<small>{notice}</small>}</form></AuthShell>;

  if(!membership)return <AuthShell dark={dark} setDark={setDark}><div className="auth-card"><ShieldCheck/><p className="kicker">ESTIBAN CREATIONS</p><h1>Workspace membership required</h1><p>Your account is signed in, but it is not attached to an active Estiban organization workspace.</p><button className="ink-button" onClick={()=>supabase!.auth.signOut()}>Sign out</button></div></AuthShell>;

  return <div className="desktop-shell">
    <aside className={menuOpen?'sidebar open':'sidebar'}>
      <div className="brand-block">
        <div className="brand-mark">EC</div>
        <div><strong>ESTIBAN</strong><span>SYSTEMS DESKTOP</span></div>
      </div>

      <div className="sidebar-label">CEO MASTER DESK</div>
      <nav className="module-nav">
        {modules.map(module=><a key={module.name} href={module.href} title={`Open ${module.name}`}>
          {module.icon}<span>{module.name}</span><ArrowUpRight/>
        </a>)}
      </nav>

      <div className="sidebar-account">
        <small>{session.user.email}</small>
        <span>{membership.role.replaceAll('_',' ')}</span>
        <button onClick={()=>supabase!.auth.signOut()}><LogOut/> Sign out</button>
      </div>
    </aside>

    <main className="desk">
      <header className="desk-topbar">
        <button className="menu-button" aria-label="Open menu" onClick={()=>setMenuOpen(value=>!value)}><Menu/></button>
        <div className="topbar-title"><span>THE ARCHITECT · ESTIBANCREATIONS</span><strong>{pageTitle(view)}</strong></div>
        <div className="topbar-actions">
          <button onClick={()=>void loadJobs()} disabled={busy}><RefreshCw className={busy?'spin':''}/> Sync</button>
          <button onClick={()=>setDark(value=>!value)}>{dark?<Sun/>:<Moon/>}{dark?'Think mode':'Dark mode'}</button>
        </div>
      </header>

      <div className="work-tabs" aria-label="Work desk navigation">
        <button className={view==='home'?'active':''} onClick={()=>navigate('home')}><Home/> Desk</button>
        <button className={view==='launch'?'active':''} onClick={()=>navigate('launch')}><Plus/> Launch</button>
        <button className={view==='active'?'active':''} onClick={()=>navigate('active')}><Activity/> Active <b>{metrics.active}</b></button>
        <button className={view==='review'?'active':''} onClick={()=>navigate('review')}><ClipboardCheck/> Review <b>{metrics.review}</b></button>
        <button className={view==='returned'?'active':''} onClick={()=>navigate('returned')}><Inbox/> Returned <b>{metrics.returned}</b></button>
      </div>

      <section className="paper-wrap">
        <div className="legal-paper">
          <div className="red-margin"/>
          <div className="paper-content">
            {view==='home'&&<HomeDesk metrics={metrics} navigate={navigate}/>} 
            {view==='launch'&&<LaunchDesk form={form} setForm={setForm} busy={busy} onSubmit={launchWorkspace}/>} 
            {(view==='active'||view==='review'||view==='returned')&&!selected&&<QueueDesk view={view} jobs={filtered} onOpen={setSelectedId}/>} 
            {selected&&<JobDetail job={selected} resultText={resultText} setResultText={setResultText} busy={busy} onBack={()=>setSelectedId('')} onTransition={transition}/>} 
          </div>
        </div>
      </section>

      {notice&&<div className="toast">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
    </main>
  </div>;
}

function HomeDesk({metrics,navigate}:{metrics:{active:number;review:number;returned:number;exceptions:number};navigate:(view:View)=>void}){
  return <>
    <section className="paper-heading">
      <p className="kicker">CEO WORKSPACE · SYSTEMS DESKTOP</p>
      <h1>Today’s Desk</h1>
      <p>Start work, see what is moving, review what came back, and open the Estiban systems from one place.</p>
    </section>

    <section className="desk-metrics">
      <button onClick={()=>navigate('active')}><span>Active work</span><strong>{metrics.active}</strong></button>
      <button onClick={()=>navigate('review')}><span>Needs review</span><strong>{metrics.review}</strong></button>
      <button onClick={()=>navigate('returned')}><span>Returned</span><strong>{metrics.returned}</strong></button>
      <div><span>Exceptions</span><strong>{metrics.exceptions}</strong></div>
    </section>

    <section className="quick-actions">
      <h2>Work Desk</h2>
      <div>
        <button className="marker primary-marker" onClick={()=>navigate('launch')}><Plus/> Launch a Workspace</button>
        <button className="marker" onClick={()=>navigate('active')}><Activity/> Open Active Work</button>
        <button className="marker" onClick={()=>navigate('review')}><ClipboardCheck/> Review Finished Work</button>
        <button className="marker" onClick={()=>navigate('returned')}><Inbox/> Open Returned Work</button>
      </div>
    </section>

    <section className="systems-section">
      <div className="section-heading"><div><p className="kicker">CONNECTED WORKSPACES</p><h2>Your Systems</h2></div><span>Open the actual system. No duplicate shell.</span></div>
      <div className="system-list">
        {systems.map(system=><article key={system.key}>
          <div><Layers3/><div><h3>{system.name}</h3><p>{system.description}</p></div></div>
          <a href={system.url}>Open <ArrowUpRight/></a>
        </article>)}
      </div>
    </section>
  </>;
}

function LaunchDesk({form,setForm,busy,onSubmit}:{form:{systemKey:string;title:string;instructions:string;returnWorkspace:string};setForm:React.Dispatch<React.SetStateAction<{systemKey:string;title:string;instructions:string;returnWorkspace:string}>>;busy:boolean;onSubmit:(event:FormEvent)=>void}){
  return <form className="launch-sheet" onSubmit={onSubmit}>
    <section className="paper-heading">
      <p className="kicker">REQUEST → WORK → REVIEW → RETURN</p>
      <h1>Launch a Workspace</h1>
      <p>Give the request once. The work stays attached to the selected system and returns to the destination you specify.</p>
    </section>
    <div className="form-row">
      <label>System
        <select value={form.systemKey} onChange={event=>setForm(current=>({...current,systemKey:event.target.value}))}>
          {systems.map(system=><option key={system.key} value={system.key}>{system.name}</option>)}
        </select>
      </label>
      <label>Return workspace
        <input value={form.returnWorkspace} onChange={event=>setForm(current=>({...current,returnWorkspace:event.target.value}))} required/>
      </label>
    </div>
    <label>Request title
      <input value={form.title} onChange={event=>setForm(current=>({...current,title:event.target.value}))} placeholder="What needs to be completed?" maxLength={180} required/>
    </label>
    <label>Instructions
      <textarea value={form.instructions} onChange={event=>setForm(current=>({...current,instructions:event.target.value}))} placeholder="Give the work, requirements, acceptance criteria, files or links involved, and anything the reviewer must verify." minLength={10} required/>
    </label>
    <button className="marker primary-marker submit-marker" disabled={busy}><Workflow/>{busy?'Launching…':'Launch Workspace'}</button>
  </form>;
}

function QueueDesk({view,jobs,onOpen}:{view:View;jobs:Job[];onOpen:(id:string)=>void}){
  return <>
    <section className="paper-heading">
      <p className="kicker">CEO WORKSPACE</p>
      <h1>{pageTitle(view)}</h1>
      <p>{queueDescription(view)}</p>
    </section>
    <div className="queue-list">
      {jobs.length===0&&<div className="empty-note">Nothing is in this queue.</div>}
      {jobs.map(job=><button key={job.id} className="queue-row" onClick={()=>onOpen(job.id)}>
        <div className="checkbox-doodle">{job.status==='returned'?<CheckCircle2/>:<span/>}</div>
        <div className="queue-copy"><strong>{job.title}</strong><span>{job.request_payload?.system_name||job.source_workspace} · returns to {job.return_workspace}</span></div>
        <Status value={job.status}/><ArrowUpRight/>
      </button>)}
    </div>
  </>;
}

function JobDetail({job,resultText,setResultText,busy,onBack,onTransition}:{job:Job;resultText:string;setResultText:(value:string)=>void;busy:boolean;onBack:()=>void;onTransition:(job:Job,next:JobStatus,reviewState?:ReviewState)=>void}){
  return <section className="job-sheet">
    <button className="back-button" onClick={onBack}><ArrowLeft/> Back to queue</button>
    <div className="detail-title"><div><p className="kicker">WORK ITEM</p><h1>{job.title}</h1><p>{job.request_payload?.instructions||'No instructions recorded.'}</p></div><Status value={job.status}/></div>
    <div className="job-facts">
      <div><span>System</span><strong>{job.request_payload?.system_name||job.source_workspace}</strong></div>
      <div><span>Assigned agent</span><strong>{job.assigned_agent||'Unassigned'}</strong></div>
      <div><span>Return workspace</span><strong>{job.return_workspace}</strong></div>
      <div><span>Review state</span><strong>{job.review_state.replaceAll('_',' ')}</strong></div>
    </div>
    <label>Work result / reviewer notes
      <textarea value={resultText} onChange={event=>setResultText(event.target.value)} placeholder="Result summary, artifact link, reviewer notes, corrections, or return instructions."/>
    </label>
    {job.result_reference?.url&&<a className="result-link" href={job.result_reference.url}>Open returned artifact <ArrowUpRight/></a>}
    <div className="workflow-actions">
      {job.status==='requested'&&<button className="marker primary-marker" disabled={busy} onClick={()=>onTransition(job,'working')}><Activity/> Start work</button>}
      {job.status==='working'&&<button className="marker primary-marker" disabled={busy} onClick={()=>onTransition(job,'review','pending')}><ClipboardCheck/> Send to review</button>}
      {job.status==='review'&&<>
        <button className="marker success-marker" disabled={busy} onClick={()=>onTransition(job,'returned','approved')}><CheckCircle2/> Approve & return</button>
        <button className="marker" disabled={busy} onClick={()=>onTransition(job,'working','changes_requested')}><Workflow/> Request changes</button>
        <button className="marker danger-marker" disabled={busy} onClick={()=>onTransition(job,'rejected','rejected')}><XCircle/> Reject</button>
      </>}
      {(job.status==='returned'||job.status==='rejected'||job.status==='failed')&&<div className="completion-note"><CheckCircle2/> This work item is closed in the current queue.</div>}
    </div>
  </section>;
}

function Status({value}:{value:JobStatus}){return <span className={`status ${value}`}>{value}</span>}

function AuthShell({children,dark,setDark}:{children:React.ReactNode;dark:boolean;setDark:(value:boolean)=>void}){
  return <main className="auth-shell"><button className="mode-float" onClick={()=>setDark(!dark)}>{dark?<Sun/>:<Moon/>}</button><div className="legal-paper auth-paper"><div className="red-margin"/><div className="paper-content">{children}</div></div></main>;
}

function pageTitle(view:View){
  if(view==='launch')return'Launch a Workspace';
  if(view==='active')return'Active Work';
  if(view==='review')return'Review';
  if(view==='returned')return'Returned Work';
  return'CEO Desk';
}

function queueDescription(view:View){
  if(view==='active')return'Everything currently requested or being worked.';
  if(view==='review')return'Finished work waiting for a reviewer decision.';
  if(view==='returned')return'Approved, rejected, failed, and returned work with its destination preserved.';
  return'';
}

function transitionLabel(from:JobStatus,to:JobStatus,reviewState:ReviewState){
  if(to==='returned')return'Approved by reviewer and returned to the requested workspace.';
  if(to==='working'&&reviewState==='changes_requested')return'Reviewer requested changes; work returned to execution.';
  if(to==='rejected')return'Reviewer rejected the work item.';
  if(from==='working'&&to==='review')return'Work completed and sent to review.';
  if(from==='requested'&&to==='working')return'Work started.';
  return`Workspace moved from ${from} to ${to}.`;
}
