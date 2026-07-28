/**
 * REYED TWO-PHONE SYNC — GOOGLE APPS SCRIPT
 * Deploy this file as a Web App: Execute as Me, access Anyone.
 * Data is saved in Script Properties; no Firebase is used.
 */

function doGet(e) {
  var p = (e && e.parameter) || {};
  var callback = safeCallback_(p.callback || "callback");
  var room = safeRoom_(p.room || "reyed-main");
  var output;
  try {
    if ((p.action || "load") === "reset") {
      PropertiesService.getScriptProperties().deleteProperty("ROOM_" + room);
      output = {ok:true, reset:true};
    } else {
      var record = readRoom_(room);
      output = record ? {ok:true, version:record.version || 0, data:record.data} : {ok:true, empty:true, version:0};
    }
  } catch (err) {
    output = {ok:false, error:String(err)};
  }
  return ContentService
    .createTextOutput(callback + "(" + JSON.stringify(output) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (body.action !== "save" || !body.data) throw new Error("Invalid save request");
    var room = safeRoom_(body.room || "reyed-main");
    var current = readRoom_(room);
    var merged = mergeDatabase_(current && current.data, body.data);
    var record = {version:Date.now(), updatedAt:new Date().toISOString(), data:merged};
    PropertiesService.getScriptProperties().setProperty("ROOM_" + room, JSON.stringify(record));
    return ContentService.createTextOutput(JSON.stringify({ok:true, version:record.version})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function readRoom_(room) {
  var raw = PropertiesService.getScriptProperties().getProperty("ROOM_" + room);
  return raw ? JSON.parse(raw) : null;
}

function mergeDatabase_(oldDb, newDb) {
  if (!oldDb || !oldDb.users || !oldDb.rides) return newDb;
  var usersById = {};
  oldDb.users.concat(newDb.users || []).forEach(function(u){ if(u && u.id) usersById[u.id]=u; });
  var ridesById = {};
  oldDb.rides.forEach(function(r){ if(r && r.id) ridesById[r.id]=r; });
  (newDb.rides || []).forEach(function(r){
    if(!r || !r.id) return;
    var old = ridesById[r.id];
    var oldTime = old ? Date.parse(old.updatedAt || old.createdAt || 0) || 0 : 0;
    var newTime = Date.parse(r.updatedAt || r.createdAt || 0) || 0;
    if(!old || newTime >= oldTime) ridesById[r.id]=r;
  });
  return {settings:newDb.settings || oldDb.settings || {}, users:Object.keys(usersById).map(function(k){return usersById[k];}), rides:Object.keys(ridesById).map(function(k){return ridesById[k];})};
}

function safeRoom_(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "").slice(0,60) || "reyed-main";
}
function safeCallback_(value) {
  var cleaned=String(value).replace(/[^a-zA-Z0-9_.$]/g, "");
  return cleaned || "callback";
}
