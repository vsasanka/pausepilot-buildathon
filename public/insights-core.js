// PausePilot Insights: explicit, deterministic SAMPLE DATA for UI design only.
// There is no telemetry collection, network transmission, or real user analytics here.
(function (root) {
  'use strict';
  const DATA = Object.freeze([
    [2,3,1,1,1,0],[3,4,1,2,1,1],[2,3,2,1,1,0],[4,5,2,2,2,0],
    [3,4,2,1,1,1],[5,4,3,2,2,1],[4,6,2,3,2,0],[3,5,2,2,1,1],
    [5,6,3,3,2,1],[4,5,3,2,2,0],[6,5,3,2,2,1],[4,6,4,3,3,1],
    [5,7,3,3,2,1],[4,6,3,2,2,0]
  ].map((item,i)=>Object.freeze({day:`D${i+1}`,flags:item[0],reviews:item[1],relaxations:item[2],revisions:item[3],helpful:item[4],unhelpful:item[5]})));
  const SERIES=Object.freeze({flags:'Movement flags',reviews:'Review prompts',relaxations:'Calm sessions',revisions:'Draft revisions'});
  const FIELDS=['flags','reviews','relaxations','revisions','helpful','unhelpful'];
  function summarize(rows=DATA){
    const totals=Object.fromEntries(FIELDS.map(k=>[k,rows.reduce((n,row)=>n+row[k],0)]));
    return Object.freeze({...totals,feedbackCount:totals.helpful+totals.unhelpful,
      feedbackPositivePct:totals.helpful+totals.unhelpful ? Math.round(100*totals.helpful/(totals.helpful+totals.unhelpful)) : null,
      revisionPct:totals.reviews ? Math.round(100*totals.revisions/totals.reviews) : null});
  }
  function render(host){
    if(!host)return;
    const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!=null)node.textContent=String(text);return node;};
    host.replaceChildren();
    const t=summarize();
    const heading=el('div','pp-insight-header');
    heading.append(el('div','pp-insight-eyebrow','PRODUCT INSIGHTS · DEMO DATA'),el('h2','pp-insight-title','A clearer view of what PausePilot could measure'),
      el('p','pp-insight-desc','14 illustrative days. These numbers are fabricated to demonstrate the dashboard—not collected from users or evidence of improved wellbeing.'));
    host.append(heading);
    const cards=el('div','pp-insight-cards');
    for(const [name,value,note] of [
      ['Movement pattern flags',t.flags,'Unusual pointer variations, not stress diagnoses'],
      ['Pre-send reviews',t.reviews,'Demo review prompts displayed'],
      ['Calming sessions',t.relaxations,'Sample sound or breathing sessions started'],
      ['Drafts revised',t.revisions,'Example edits after a review prompt']]){
      const card=el('div','pp-insight-card');card.append(el('span','pp-insight-label',name),el('strong','pp-insight-value',value),el('small','pp-insight-note',note));cards.append(card);
    }
    host.append(cards);
    const chart=el('section','pp-insight-chart');
    const top=el('div','pp-insight-chart-top');top.append(el('h3','','Example activity over time'));
    const chooser=el('select','pp-insight-select');chooser.setAttribute('aria-label','Choose example metric');
    for(const [id,title] of Object.entries(SERIES)){const option=el('option','',title);option.value=id;chooser.append(option);}
    top.append(chooser);chart.append(top);
    const bars=el('div','pp-insight-bars');bars.setAttribute('role','img');chart.append(bars);
    const axis=el('div','pp-insight-axis');axis.append(el('span','','Day 1'),el('span','','Day 7'),el('span','','Day 14'));chart.append(axis);
    const legend=el('p','pp-insight-desc','Compare trends, not clinical outcomes. All values are illustrative.');chart.append(legend);
    host.append(chart);
    function draw(key){
      const values=DATA.map(row=>row[key]);const ceiling=Math.max(1,...values);
      bars.replaceChildren();
      bars.setAttribute('aria-label',SERIES[key]+': '+values.map((v,i)=>`day ${i+1}: ${v}`).join(', ')+'; synthetic values');
      DATA.forEach((row,index)=>{
        const cell=el('div','pp-insight-bar-cell');
        const bar=el('div','pp-insight-bar');bar.style.height=`${Math.max(7,Math.round(100*row[key]/ceiling))}%`;
        bar.title=`Day ${index+1}: ${row[key]} (sample)`;
        cell.append(bar);bars.append(cell);
      });
    }
    chooser.addEventListener('change',()=>draw(chooser.value));draw('flags');
    const foot=el('div','pp-insight-bottom');
    const feedback=el('div','pp-insight-card');feedback.append(el('span','pp-insight-label','Sample helpful feedback'),el('strong','pp-insight-value',`${t.feedbackPositivePct}%`),el('small','pp-insight-note',`${t.helpful} helpful / ${t.feedbackCount} total synthetic ratings. No real users surveyed.`));
    const revision=el('div','pp-insight-card');revision.append(el('span','pp-insight-label','Example revision share'),el('strong','pp-insight-value',`${t.revisionPct}%`),el('small','pp-insight-note',`${t.revisions} mock revisions / ${t.reviews} mock review prompts. Not a measured behavior change.`));
    foot.append(feedback,revision);host.append(foot);
    host.append(el('p','pp-insight-privacy','SAMPLE DATA ONLY · No interaction logging, cursor trails, message text, or user identifiers are stored by this dashboard. Future real metrics should require opt-in and use local daily aggregates.'));
  }
  root.PausePilotInsights=Object.freeze({DATA,SERIES,summarize,render});
})(globalThis);
