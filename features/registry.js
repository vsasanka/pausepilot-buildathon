// Shared product capabilities: add future text-intervention features here.
// Clients receive only public-facing definitions; the model key remains on the server.
export const FEATURE_REGISTRY = Object.freeze([
  Object.freeze({
    id: 'email',classifierChannel:'email',
    title: 'Email Send Guard',
    description: 'Review a message before a simulated email send.',
    action: 'Send email',
    composerTitle: 'Compose an email',
    fieldLabel: 'Email message',
    examples: Object.freeze([
      {id:'angry',label:'Personal attack',text:"You've messed this up again. Do you even read my emails? Fix it immediately."},
      {id:'firm',label:'Firm but professional',text:'The report contains three errors. Please correct the figures and send an updated copy before 5 PM.'},
      {id:'quoted',label:'Quoted complaint',text:"A customer wrote: 'You are an idiot.' I'm sharing the exact wording for our incident record, not directing it at you."},
    ]),
  }),
  Object.freeze({
    id: 'comment',classifierChannel:'comment',
    title: 'Comment Guard',
    description: 'Review a comment before a simulated online post.',
    action: 'Post comment',
    composerTitle: 'Compose a comment',
    fieldLabel: 'Comment text',
    examples: Object.freeze([
      {id:'angry',label:'Hostile reply',text:'You are an idiot. Do you even understand what you are talking about?'},
      {id:'firm',label:'Respectful disagreement',text:'I disagree with that conclusion. Could you share the source for this claim?'},
      {id:'quoted',label:'Reporting abuse',text:"Someone replied 'You are worthless.' I am documenting this comment to report the harassment."},
    ]),
  }),
]);
export function listFeatures() {
  return FEATURE_REGISTRY.map(feature => ({
    id:feature.id,title:feature.title,description:feature.description,action:feature.action,
    composerTitle:feature.composerTitle,fieldLabel:feature.fieldLabel,
    examples:feature.examples.map(example=>({...example})),
  }));
}
export function getFeature(id){return FEATURE_REGISTRY.find(x=>x.id===id)||null;}
