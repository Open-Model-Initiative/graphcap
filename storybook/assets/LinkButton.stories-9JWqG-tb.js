import{j as o}from"./jsx-runtime-DiklIkkE.js";import{r as c,t as tt,j as B,d as rt,m as et,u as ot,a as nt,R as st,M as at,g as it,L as x,c as ct}from"./LinkButton-Cya8ejw6.js";import{r as Y,R as ut}from"./index-DRjF_FHU.js";import{i as lt}from"./tiny-invariant-CopsF_GD.js";import{S as R}from"./search-DItlWsO6.js";import"./index-DCfoyVzz.js";import"./bundle-mjs-BTGVH9Kg.js";import"./index-Bx0Ph3cE.js";import"./index-C2sCW7CK.js";import"./createLucideIcon-DgdrlRR4.js";class ht{constructor(e){if(this.init=r=>{var s,a;this.originalIndex=r.originalIndex;const n=this.options,L=!(n!=null&&n.path)&&!(n!=null&&n.id);if(this.parentRoute=(a=(s=this.options).getParentRoute)==null?void 0:a.call(s),L)this._path=c;else if(!this.parentRoute)throw new Error("Child Route instances must pass a 'getParentRoute: () => ParentRoute' option that returns a Route instance.");let i=L?c:n==null?void 0:n.path;i&&i!=="/"&&(i=tt(i));const Z=(n==null?void 0:n.id)||i;let l=L?c:B([this.parentRoute.id===c?"":this.parentRoute.id,Z]);i===c&&(i="/"),l!==c&&(l=B(["/",l]));const k=l===c?"/":B([this.parentRoute.fullPath,i]);this._path=i,this._id=l,this._fullPath=k,this._to=k,this._ssr=(n==null?void 0:n.ssr)??r.defaultSsr??!0},this.addChildren=r=>this._addFileChildren(r),this._addFileChildren=r=>(Array.isArray(r)&&(this.children=r),typeof r=="object"&&r!==null&&(this.children=Object.values(r)),this),this._addFileTypes=()=>this,this.updateLoader=r=>(Object.assign(this.options,r),this),this.update=r=>(Object.assign(this.options,r),this),this.lazy=r=>(this.lazyFn=r,this),this.options=e||{},this.isRoot=!(e!=null&&e.getParentRoute),e!=null&&e.id&&(e!=null&&e.path))throw new Error("Route cannot have both an 'id' and a 'path' option.")}get to(){return this._to}get id(){return this._id}get path(){return this._path}get fullPath(){return this._fullPath}get ssr(){return this._ssr}}class dt extends ht{constructor(e){super(e)}}function u(t){const e=Y.useContext(t.from?rt:et);return ot({select:s=>{const a=s.matches.find(n=>t.from?t.from===n.routeId:n.id===e);if(lt(!((t.shouldThrow??!0)&&!a),`Could not find ${t.from?`an active match from "${t.from}"`:"a nearest match!"}`),a!==void 0)return t.select?t.select(a):a},structuralSharing:t.structuralSharing})}function mt(t){return u({from:t.from,strict:t.strict,structuralSharing:t.structuralSharing,select:e=>t.select?t.select(e.loaderData):e.loaderData})}function pt(t){const{select:e,...r}=t;return u({...r,select:s=>e?e(s.loaderDeps):s.loaderDeps})}function gt(t){return u({from:t.from,strict:t.strict,shouldThrow:t.shouldThrow,structuralSharing:t.structuralSharing,select:e=>t.select?t.select(e.params):e.params})}function ft(t){return u({from:t.from,strict:t.strict,shouldThrow:t.shouldThrow,structuralSharing:t.structuralSharing,select:e=>t.select?t.select(e.search):e.search})}function vt(t){const{navigate:e}=nt();return Y.useCallback(r=>e({from:t==null?void 0:t.from,...r}),[t==null?void 0:t.from,e])}class St extends dt{constructor(e){super(e),this.useMatch=r=>u({select:r==null?void 0:r.select,from:this.id,structuralSharing:r==null?void 0:r.structuralSharing}),this.useRouteContext=r=>u({...r,from:this.id,select:s=>r!=null&&r.select?r.select(s.context):s.context}),this.useSearch=r=>ft({select:r==null?void 0:r.select,structuralSharing:r==null?void 0:r.structuralSharing,from:this.id}),this.useParams=r=>gt({select:r==null?void 0:r.select,structuralSharing:r==null?void 0:r.structuralSharing,from:this.id}),this.useLoaderDeps=r=>pt({...r,from:this.id}),this.useLoaderData=r=>mt({...r,from:this.id}),this.useNavigate=()=>vt({from:this.fullPath}),this.$$typeof=Symbol.for("react.memo")}}function yt(t){return new St(t)}const xt=t=>new Rt(t);class Rt extends st{constructor(e){super(e)}}function Lt({router:t,children:e,...r}){t.update({...t.options,...r,context:{...t.options.context,...r.context}});const s=it(),a=o.jsx(s.Provider,{value:t,children:e});return t.options.Wrap?o.jsx(t.options.Wrap,{children:a}):a}function Bt({router:t,...e}){return o.jsx(Lt,{router:t,...e,children:o.jsx(at,{})})}const kt=({children:t})=>{const e=yt({component:()=>t}),r=ut.useMemo(()=>xt({routeTree:e,history:ct({initialEntries:["/"]})}),[e]);return o.jsx(Bt,{router:r})},Dt={title:"Components/Button/LinkButton",component:x,parameters:{layout:"centered"},decorators:[(t,e)=>{const r=JSON.stringify(e.args);return o.jsx(kt,{children:o.jsx(t,{})},r)}],tags:["autodocs"],argTypes:{variant:{control:"select",options:["solid","outline","ghost"]},colorscheme:{control:"select",options:["primary","secondary","accent"]},size:{control:"select",options:["sm","md","lg","icon"]},to:{control:"text"}}},h={args:{variant:"solid",colorscheme:"primary",children:"Primary Link Button",to:"/"}},d={args:{variant:"solid",colorscheme:"secondary",children:"Secondary Link Button",to:"/about"}},m={args:{variant:"solid",colorscheme:"accent",children:"Accent Link Button",to:"/about"}},p={args:{variant:"outline",colorscheme:"primary",children:"Outline Link Button",to:"/about"}},g={args:{variant:"ghost",colorscheme:"primary",children:"Ghost Link Button",to:"/about"}},f={args:{size:"sm",children:"Small Link Button",to:"/"}},v={args:{size:"lg",children:"Large Link Button",to:"/"}},S={args:{size:"icon",variant:"ghost",colorscheme:"primary",children:o.jsx(R,{className:"h-5 w-5"}),to:"/"}},y={render:()=>o.jsxs("div",{className:"flex flex-wrap gap-4",children:[o.jsx(x,{size:"icon",variant:"solid",colorscheme:"primary",to:"/",children:o.jsx(R,{className:"h-5 w-5"})}),o.jsx(x,{size:"icon",variant:"outline",colorscheme:"primary",to:"/about",children:o.jsx(R,{className:"h-5 w-5"})}),o.jsx(x,{size:"icon",variant:"ghost",colorscheme:"primary",to:"/about",children:o.jsx(R,{className:"h-5 w-5"})})]})};var j,b,w;h.parameters={...h.parameters,docs:{...(j=h.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    variant: "solid",
    colorscheme: "primary",
    children: "Primary Link Button",
    to: "/"
  }
}`,...(w=(b=h.parameters)==null?void 0:b.docs)==null?void 0:w.source}}};var P,z,C;d.parameters={...d.parameters,docs:{...(P=d.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    variant: "solid",
    colorscheme: "secondary",
    children: "Secondary Link Button",
    to: "/about"
  }
}`,...(C=(z=d.parameters)==null?void 0:z.docs)==null?void 0:C.source}}};var _,I,N;m.parameters={...m.parameters,docs:{...(_=m.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    variant: "solid",
    colorscheme: "accent",
    children: "Accent Link Button",
    to: "/about"
  }
}`,...(N=(I=m.parameters)==null?void 0:I.docs)==null?void 0:N.source}}};var A,D,M;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    variant: "outline",
    colorscheme: "primary",
    children: "Outline Link Button",
    to: "/about"
  }
}`,...(M=(D=p.parameters)==null?void 0:D.docs)==null?void 0:M.source}}};var T,E,O;g.parameters={...g.parameters,docs:{...(T=g.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    variant: "ghost",
    colorscheme: "primary",
    children: "Ghost Link Button",
    to: "/about"
  }
}`,...(O=(E=g.parameters)==null?void 0:E.docs)==null?void 0:O.source}}};var F,G,$;f.parameters={...f.parameters,docs:{...(F=f.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    size: "sm",
    children: "Small Link Button",
    to: "/"
  }
}`,...($=(G=f.parameters)==null?void 0:G.docs)==null?void 0:$.source}}};var W,H,J;v.parameters={...v.parameters,docs:{...(W=v.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    size: "lg",
    children: "Large Link Button",
    to: "/"
  }
}`,...(J=(H=v.parameters)==null?void 0:H.docs)==null?void 0:J.source}}};var q,K,Q;S.parameters={...S.parameters,docs:{...(q=S.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    size: "icon",
    variant: "ghost",
    colorscheme: "primary",
    children: <SearchIcon className="h-5 w-5" />,
    to: "/"
  }
}`,...(Q=(K=S.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var U,V,X;y.parameters={...y.parameters,docs:{...(U=y.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-4">
      <LinkButton size="icon" variant="solid" colorscheme="primary" to="/">
        <SearchIcon className="h-5 w-5" />
      </LinkButton>
      <LinkButton size="icon" variant="outline" colorscheme="primary" to="/about">
        <SearchIcon className="h-5 w-5" />
      </LinkButton>
      <LinkButton size="icon" variant="ghost" colorscheme="primary" to="/about">
        <SearchIcon className="h-5 w-5" />
      </LinkButton>
    </div>
}`,...(X=(V=y.parameters)==null?void 0:V.docs)==null?void 0:X.source}}};const Mt=["Primary","Secondary","Accent","Outline","Ghost","Small","Large","Icon","AllIconButtons"];export{m as Accent,y as AllIconButtons,g as Ghost,S as Icon,v as Large,p as Outline,h as Primary,d as Secondary,f as Small,Mt as __namedExportsOrder,Dt as default};
