import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as l}from"./index-DRjF_FHU.js";import"./Text-B4Kczdio.js";import{c as U}from"./utils-D64OaFpV.js";import"./index-DCfoyVzz.js";import"./bundle-mjs-BTGVH9Kg.js";import"./index-C2sCW7CK.js";const a=l.forwardRef(({className:i,autoGrow:r,width:s="full",height:p="md",...t},O)=>{const f=l.useRef(null),$=X(O,f),[B,w]=l.useState(t.value||t.defaultValue||"");l.useEffect(()=>{if(!r||!f.current)return;const n=f.current;n.style.height="auto",n.style.height=`${n.scrollHeight}px`},[r,B]),l.useEffect(()=>{t.value!==void 0&&w(t.value)},[t.value]);const J=n=>{var v;w(n.target.value),(v=t.onChange)==null||v.call(t,n)},K={sm:"w-32",md:"w-64",lg:"w-96",full:"w-full"},Q={sm:"min-h-12",md:"min-h-16",lg:"min-h-32"};return e.jsx("textarea",{ref:$,"data-slot":"textarea",className:U("border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",K[s],Q[p],r&&"overflow-hidden transition-height duration-200",i),...t,onChange:J})});function X(...i){const r=l.useRef(null);return l.useEffect(()=>{i.forEach(s=>{s&&(typeof s=="function"?s(r.current):s.current=r.current)})},[i]),r}a.displayName="Textarea";a.__docgenInfo={description:"",methods:[],displayName:"Textarea",props:{autoGrow:{required:!1,tsType:{name:"boolean"},description:""},width:{required:!1,tsType:{name:"union",raw:'"sm" | "md" | "lg" | "full"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'},{name:"literal",value:'"lg"'},{name:"literal",value:'"full"'}]},description:"",defaultValue:{value:'"full"',computed:!1}},height:{required:!1,tsType:{name:"union",raw:'"sm" | "md" | "lg"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'},{name:"literal",value:'"lg"'}]},description:"",defaultValue:{value:'"md"',computed:!1}}}};const ie={title:"Components/Fields/Textarea",component:a,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{placeholder:{control:"text",description:"Placeholder text when the textarea is empty"},disabled:{control:"boolean",description:"Whether the textarea is disabled"},className:{control:"text",description:"Additional CSS classes to apply"},defaultValue:{control:"text",description:"Default value for the textarea"},maxLength:{control:"number",description:"Maximum number of characters allowed"},rows:{control:"number",description:"Number of visible text lines"},autoGrow:{control:"boolean",description:"Whether the textarea should automatically grow with content",defaultValue:!1},width:{control:"select",options:["sm","md","lg","full"],description:"Predefined width of the textarea",defaultValue:"full"},height:{control:"select",options:["sm","md","lg"],description:"Predefined height of the textarea",defaultValue:"md"}}},d={args:{placeholder:"Type something...",width:"full",height:"md"}},o={render:()=>e.jsxs("div",{className:"flex flex-col space-y-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-1",children:"Small width (w-32)"}),e.jsx(a,{placeholder:"Small width",width:"sm"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-1",children:"Medium width (w-64)"}),e.jsx(a,{placeholder:"Medium width",width:"md"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-1",children:"Large width (w-96)"}),e.jsx(a,{placeholder:"Large width",width:"lg"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-1",children:"Full width (w-full)"}),e.jsx(a,{placeholder:"Full width",width:"full"})]})]})},c={render:()=>e.jsxs("div",{className:"flex flex-col space-y-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-1",children:"Small height (min-h-12)"}),e.jsx(a,{placeholder:"Small height",height:"sm",width:"lg"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-1",children:"Medium height (min-h-16)"}),e.jsx(a,{placeholder:"Medium height",height:"md",width:"lg"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-1",children:"Large height (min-h-32)"}),e.jsx(a,{placeholder:"Large height",height:"lg",width:"lg"})]})]})},h={args:{disabled:!0,placeholder:"This textarea is disabled",defaultValue:"Cannot edit this content"}},m={args:{placeholder:"This has an error",defaultValue:"This content has some validation error","aria-invalid":"true"}},u={args:{placeholder:"This textarea can be resized by the user...",className:"resize"}},x={args:{placeholder:"Start typing to see me grow...",autoGrow:!0,rows:1,defaultValue:""},decorators:[i=>e.jsxs("div",{className:"max-w-md",children:[e.jsx("p",{className:"text-sm text-gray-500 mb-2",children:"This textarea automatically grows with content"}),e.jsx(i,{})]})]},Y=()=>{const[r,s]=l.useState(""),p=r.length;return e.jsxs("div",{className:"space-y-2 max-w-md",children:[e.jsx(a,{placeholder:"Start typing...",value:r,onChange:t=>s(t.target.value),maxLength:100,autoGrow:!0}),e.jsxs("div",{className:"text-xs text-right text-gray-500",children:[p,"/",100," characters"]})]})},g={render:()=>e.jsx(Y,{})};var b,y,j;d.parameters={...d.parameters,docs:{...(b=d.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    placeholder: "Type something...",
    width: "full",
    height: "md"
  }
}`,...(j=(y=d.parameters)==null?void 0:y.docs)==null?void 0:j.source}}};var N,T,S;o.parameters={...o.parameters,docs:{...(N=o.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-1">Small width (w-32)</p>
        <Textarea placeholder="Small width" width="sm" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Medium width (w-64)</p>
        <Textarea placeholder="Medium width" width="md" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Large width (w-96)</p>
        <Textarea placeholder="Large width" width="lg" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Full width (w-full)</p>
        <Textarea placeholder="Full width" width="full" />
      </div>
    </div>
}`,...(S=(T=o.parameters)==null?void 0:T.docs)==null?void 0:S.source}}};var C,V,L;c.parameters={...c.parameters,docs:{...(C=c.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-1">Small height (min-h-12)</p>
        <Textarea placeholder="Small height" height="sm" width="lg" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Medium height (min-h-16)</p>
        <Textarea placeholder="Medium height" height="md" width="lg" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Large height (min-h-32)</p>
        <Textarea placeholder="Large height" height="lg" width="lg" />
      </div>
    </div>
}`,...(L=(V=c.parameters)==null?void 0:V.docs)==null?void 0:L.source}}};var R,W,E;h.parameters={...h.parameters,docs:{...(R=h.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: "This textarea is disabled",
    defaultValue: "Cannot edit this content"
  }
}`,...(E=(W=h.parameters)==null?void 0:W.docs)==null?void 0:E.source}}};var M,z,D;m.parameters={...m.parameters,docs:{...(M=m.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    placeholder: "This has an error",
    defaultValue: "This content has some validation error",
    "aria-invalid": "true"
  }
}`,...(D=(z=m.parameters)==null?void 0:z.docs)==null?void 0:D.source}}};var F,G,_;u.parameters={...u.parameters,docs:{...(F=u.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    placeholder: "This textarea can be resized by the user...",
    className: "resize"
  }
}`,...(_=(G=u.parameters)==null?void 0:G.docs)==null?void 0:_.source}}};var q,A,H;x.parameters={...x.parameters,docs:{...(q=x.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    placeholder: "Start typing to see me grow...",
    autoGrow: true,
    rows: 1,
    defaultValue: ""
  },
  decorators: [Story => <div className="max-w-md">
        <p className="text-sm text-gray-500 mb-2">
          This textarea automatically grows with content
        </p>
        <Story />
      </div>]
}`,...(H=(A=x.parameters)==null?void 0:A.docs)==null?void 0:H.source}}};var P,k,I;g.parameters={...g.parameters,docs:{...(P=g.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => <TextareaWithCharacterCount />
}`,...(I=(k=g.parameters)==null?void 0:k.docs)==null?void 0:I.source}}};const ne=["Default","Widths","Heights","Disabled","WithError","Resizable","AutoGrowing","WithCharacterCount"];export{x as AutoGrowing,d as Default,h as Disabled,c as Heights,u as Resizable,o as Widths,g as WithCharacterCount,m as WithError,ne as __namedExportsOrder,ie as default};
