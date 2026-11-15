import test from 'node:test';
import assert from 'node:assert/strict';
import {getFeature,listFeatures} from '../features/registry.js';
import {createAppServer} from '../server.js';
import {createSecurity} from '../lib/deploy-security.js';

test('feature registry exposes two interactive channels with distinct scenarios',()=>{
  const features=listFeatures();
  assert.deepEqual(features.map(f=>f.id),['email','comment']);
  for(const feature of features){
    assert.ok(feature.action);assert.ok(feature.composerTitle);
    assert.ok(feature.examples.length>=3);
    assert.ok(feature.examples.every(e=>typeof e.text==='string'&&e.text.length>0));
  }
  assert.equal(getFeature('unknown'),null);
});

test('feature catalog is public, but unsupported analysis channel is rejected',async()=>{
  const security=createSecurity({production:false,origin:'https://pausepilot.example',secret:'test-test-test-test-test-test-test-abc'});
  const seen=[];
  const server=createAppServer({security,analyze:async(text,context)=>{
    seen.push(context.channel);return {decision:'allow',reason:'No concern',evidence:'',suggestion:'',mode:'ai'};
  }});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    const catalog=await (await fetch(`${base}/api/features`)).json();
    assert.deepEqual(catalog.features.map(f=>f.id),['email','comment']);
    const origin='https://pausepilot.example';
    const session=await fetch(`${base}/api/session`,{headers:{Origin:origin,'Sec-Fetch-Site':'same-origin'}});
    const cookie=session.headers.get('set-cookie').split(';')[0];
    const {csrf}=await session.json();
    async function analyze(channel){return fetch(`${base}/api/analyze`,{method:'POST',headers:{Origin:origin,'Sec-Fetch-Site':'same-origin',Cookie:cookie,'X-PausePilot-CSRF':csrf,'Content-Type':'application/json'},body:JSON.stringify({text:'A normal test sentence',channel})});}
    assert.equal((await analyze('unsupported')).status,400);
    assert.equal((await analyze('comment')).status,200);
    assert.deepEqual(seen,['comment']);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
