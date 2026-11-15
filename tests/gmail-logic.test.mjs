import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(readFileSync(new URL('../extension/gmail-helpers.js',import.meta.url),'utf8'),context);
const G=context.PausePilotGmail;
const button=attrs=>({getAttribute:key=>attrs[key]??null,textContent:attrs.text||''});
for(const attr of [{text:'Send'},{'aria-label':'Send (⌘Enter)'},{'data-tooltip':'Send \u202a(⌘Enter)\u202c'},{'data-tooltip':'Send (Ctrl+Enter)'}]){
  test(`Send label recognized: ${JSON.stringify(attr)}`,()=>assert.equal(G.isSendButton(button(attr)),true));
}
for(const attr of [{text:'Send & archive'},{text:'Schedule send'},{text:'Resend'},{'aria-label':'Send to trash'},{}]){
  test(`Unrelated button not mistaken for Send: ${JSON.stringify(attr)}`,()=>assert.equal(G.isSendButton(button(attr)),false));
}
test('Snapshot changes when recipient or subject changes',()=>{
  const recipient={getAttribute:k=>k==='name'?'to':null,value:'me@example.com',textContent:''};
  const subject={getAttribute:k=>k==='name'?'subjectbox':null,value:'Hello',textContent:''};
  const root={isConnected:true,innerText:'To: me@example.com\nSubject: Hello\nhello',querySelectorAll:()=>[recipient,subject]};
  const body={isConnected:true,innerText:'hello'};
  const composer={root,body};
  const start=G.snapshot(composer);
  recipient.value='somebody@example.com';
  assert.notEqual(G.snapshot(composer).fingerprint,start.fingerprint);
  recipient.value='me@example.com';subject.value='Other subject';
  assert.notEqual(G.snapshot(composer).fingerprint,start.fingerprint);
  subject.value='Hello';body.innerText='changed text';
  assert.notEqual(G.snapshot(composer).fingerprint,start.fingerprint);
});

test('Recipient chip changes invalidate approval snapshots',()=>{
  const chip={getAttribute:k=>k==='email'?'first@example.com':null,textContent:'Alex'};
  const root={isConnected:true,innerText:'To: first@example.com',querySelectorAll:selector=>selector.includes('.vR')?[chip]:[]};
  const body={isConnected:true,innerText:'Same message'};
  const before=G.snapshot({root,body}).fingerprint;
  chip.getAttribute=k=>k==='email'?'second@example.com':null;
  assert.notEqual(G.snapshot({root,body}).fingerprint,before);
});

test('Transient Gmail save-status text does not revoke approval',()=>{
  const subject={getAttribute:k=>k==='name'?'subjectbox':null,value:'Status',textContent:''};
  const root={isConnected:true,innerText:'To: Alex\nDraft saved',querySelectorAll:selector=>selector.includes('.vR')?[]:[subject]};
  const body={isConnected:true,innerText:'Same message'};
  const before=G.snapshot({root,body}).fingerprint;
  root.innerText='To: Alex\nSaving...';
  assert.equal(G.snapshot({root,body}).fingerprint,before);
});
