(function(){
  const cfg=window.REYED_GOOGLE_SYNC||{};
  const endpoint=String(cfg.endpoint||"").trim();
  const room=String(cfg.room||"reyed-main").trim();
  const configured=/^https:\/\/script\.google\.com\/macros\/s\//.test(endpoint) && !endpoint.includes("PASTE_");
  let applyingRemote=false,lastRemoteVersion=0,pollTimer=null,saveTimer=null;

  function status(state,message){
    window.dispatchEvent(new CustomEvent("reyed-cloud-status",{detail:{state,message}}));
  }
  function jsonp(params){
    return new Promise((resolve,reject)=>{
      const callback="reyedJsonp_"+Date.now()+"_"+Math.random().toString(36).slice(2);
      const script=document.createElement("script");
      const timeout=setTimeout(()=>cleanup(new Error("Sync request timed out")),12000);
      function cleanup(err,value){
        clearTimeout(timeout);delete window[callback];script.remove();err?reject(err):resolve(value);
      }
      window[callback]=value=>cleanup(null,value);
      script.onerror=()=>cleanup(new Error("Could not reach Google sync"));
      const url=new URL(endpoint);
      Object.entries({...params,callback}).forEach(([k,v])=>url.searchParams.set(k,v));
      url.searchParams.set("_",Date.now());
      script.src=url.toString();document.head.appendChild(script);
    });
  }
  async function loadRemote(){
    if(!configured)return;
    try{
      const result=await jsonp({action:"load",room});
      if(result?.ok && result.data?.users && result.data?.rides){
        if(Number(result.version||0)>lastRemoteVersion){
          lastRemoteVersion=Number(result.version||0);
          applyingRemote=true;
          window.dispatchEvent(new CustomEvent("reyed-cloud-db",{detail:result.data}));
          applyingRemote=false;
        }
        status("online","Two-phone Google sync connected");
      }else if(result?.empty && typeof getDB==="function"){
        await saveRemote(getDB());
      }
    }catch(err){
      console.warn(err);status("error","Google sync is temporarily unavailable");
    }
  }
  async function saveRemote(data){
    if(!configured||applyingRemote)return;
    try{
      const payload={action:"save",room,data,clientUpdatedAt:Date.now()};
      // no-cors lets GitHub Pages post to Apps Script. Updates are confirmed by polling.
      await fetch(endpoint,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
      status("online","Saving ride updates…");
      setTimeout(loadRemote,600);
    }catch(err){
      console.warn(err);status("error","Could not save to Google sync");
    }
  }

  if(!configured){
    status("offline","Local demo mode — add the Google Apps Script URL for two phones");
    return;
  }

  window.reyedCloudSave=data=>{
    clearTimeout(saveTimer);
    return new Promise(resolve=>{
      saveTimer=setTimeout(()=>saveRemote(data).finally(resolve),180);
    });
  };
  status("connecting","Connecting both phones through Google…");
  loadRemote();
  pollTimer=setInterval(loadRemote,1800);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)loadRemote()});
})();
