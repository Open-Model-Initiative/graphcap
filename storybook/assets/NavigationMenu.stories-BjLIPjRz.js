import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as s}from"./index-DRjF_FHU.js";import{h as en}from"./index-Bx0Ph3cE.js";import{e as z,u as Ie,P as T,c as nn,i as D,a as ke,d as I,j as tn,D as on,g as Z,k as de}from"./index-raCaFgPy.js";import{u as an,a as rn,c as Re,C as sn}from"./index-DBBtbRI-.js";import{P as q}from"./index-DaNpo5cX.js";import{R as cn}from"./index-Bu6lKAkr.js";import{c as Ee}from"./index-C2sCW7CK.js";import{c as L}from"./utils-D64OaFpV.js";import{H as ae,S as Y}from"./settings-BTGPkF3p.js";import{c as Te}from"./createLucideIcon-DgdrlRR4.js";import"./bundle-mjs-BTGVH9Kg.js";/**
 * @license lucide-react v0.503.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const un=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],_e=Te("calendar",un);/**
 * @license lucide-react v0.503.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ln=[["path",{d:"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",key:"1kt360"}]],Le=Te("folder",ln);var F="NavigationMenu",[ie,Pe,dn]=Re(F),[J,gn,mn]=Re(F),[re,Qn]=nn(F,[dn,mn]),[fn,E]=re(F),[vn,pn]=re(F),Se=s.forwardRef((n,t)=>{const{__scopeNavigationMenu:a,value:i,onValueChange:o,defaultValue:r,delayDuration:c=200,skipDelayDuration:d=300,orientation:u="horizontal",dir:N,...l}=n,[v,j]=s.useState(null),y=z(t,x=>j(x)),h=an(N),p=s.useRef(0),w=s.useRef(0),b=s.useRef(0),[_,m]=s.useState(!0),[f,g]=Ie({prop:i,onChange:x=>{const S=x!=="",X=d>0;S?(window.clearTimeout(b.current),X&&m(!1)):(window.clearTimeout(b.current),b.current=window.setTimeout(()=>m(!0),d)),o==null||o(x)},defaultProp:r??"",caller:F}),M=s.useCallback(()=>{window.clearTimeout(w.current),w.current=window.setTimeout(()=>g(""),150)},[g]),k=s.useCallback(x=>{window.clearTimeout(w.current),g(x)},[g]),P=s.useCallback(x=>{f===x?window.clearTimeout(w.current):p.current=window.setTimeout(()=>{window.clearTimeout(w.current),g(x)},c)},[f,g,c]);return s.useEffect(()=>()=>{window.clearTimeout(p.current),window.clearTimeout(w.current),window.clearTimeout(b.current)},[]),e.jsx(De,{scope:a,isRootMenu:!0,value:f,dir:h,orientation:u,rootNavigationMenu:v,onTriggerEnter:x=>{window.clearTimeout(p.current),_?P(x):k(x)},onTriggerLeave:()=>{window.clearTimeout(p.current),M()},onContentEnter:()=>window.clearTimeout(w.current),onContentLeave:M,onItemSelect:x=>{g(S=>S===x?"":x)},onItemDismiss:()=>g(""),children:e.jsx(T.nav,{"aria-label":"Main","data-orientation":u,dir:h,...l,ref:y})})});Se.displayName=F;var ee="NavigationMenuSub",xn=s.forwardRef((n,t)=>{const{__scopeNavigationMenu:a,value:i,onValueChange:o,defaultValue:r,orientation:c="horizontal",...d}=n,u=E(ee,a),[N,l]=Ie({prop:i,onChange:o,defaultProp:r??"",caller:ee});return e.jsx(De,{scope:a,isRootMenu:!1,value:N,dir:u.dir,orientation:c,rootNavigationMenu:u.rootNavigationMenu,onTriggerEnter:v=>l(v),onItemSelect:v=>l(v),onItemDismiss:()=>l(""),children:e.jsx(T.div,{"data-orientation":c,...d,ref:t})})});xn.displayName=ee;var De=n=>{const{scope:t,isRootMenu:a,rootNavigationMenu:i,dir:o,orientation:r,children:c,value:d,onItemSelect:u,onItemDismiss:N,onTriggerEnter:l,onTriggerLeave:v,onContentEnter:j,onContentLeave:y}=n,[h,p]=s.useState(null),[w,b]=s.useState(new Map),[_,m]=s.useState(null);return e.jsx(fn,{scope:t,isRootMenu:a,rootNavigationMenu:i,value:d,previousValue:rn(d),baseId:ke(),dir:o,orientation:r,viewport:h,onViewportChange:p,indicatorTrack:_,onIndicatorTrackChange:m,onTriggerEnter:D(l),onTriggerLeave:D(v),onContentEnter:D(j),onContentLeave:D(y),onItemSelect:D(u),onItemDismiss:D(N),onViewportContentChange:s.useCallback((f,g)=>{b(M=>(M.set(f,g),new Map(M)))},[]),onViewportContentRemove:s.useCallback(f=>{b(g=>g.has(f)?(g.delete(f),new Map(g)):g)},[]),children:e.jsx(ie.Provider,{scope:t,children:e.jsx(vn,{scope:t,items:w,children:c})})})},Fe="NavigationMenuList",Oe=s.forwardRef((n,t)=>{const{__scopeNavigationMenu:a,...i}=n,o=E(Fe,a),r=e.jsx(T.ul,{"data-orientation":o.orientation,...i,ref:t});return e.jsx(T.div,{style:{position:"relative"},ref:o.onIndicatorTrackChange,children:e.jsx(ie.Slot,{scope:a,children:o.isRootMenu?e.jsx(Be,{asChild:!0,children:r}):r})})});Oe.displayName=Fe;var Ae="NavigationMenuItem",[hn,Ve]=re(Ae),Ke=s.forwardRef((n,t)=>{const{__scopeNavigationMenu:a,value:i,...o}=n,r=ke(),c=i||r||"LEGACY_REACT_AUTO_VALUE",d=s.useRef(null),u=s.useRef(null),N=s.useRef(null),l=s.useRef(()=>{}),v=s.useRef(!1),j=s.useCallback((h="start")=>{if(d.current){l.current();const p=te(d.current);p.length&&ue(h==="start"?p:p.reverse())}},[]),y=s.useCallback(()=>{if(d.current){const h=te(d.current);h.length&&(l.current=Cn(h))}},[]);return e.jsx(hn,{scope:a,value:c,triggerRef:u,contentRef:d,focusProxyRef:N,wasEscapeCloseRef:v,onEntryKeyDown:j,onFocusProxyEnter:j,onRootContentClose:y,onContentFocusOutside:y,children:e.jsx(T.li,{...o,ref:t})})});Ke.displayName=Ae;var ne="NavigationMenuTrigger",ze=s.forwardRef((n,t)=>{const{__scopeNavigationMenu:a,disabled:i,...o}=n,r=E(ne,n.__scopeNavigationMenu),c=Ve(ne,n.__scopeNavigationMenu),d=s.useRef(null),u=z(d,c.triggerRef,t),N=Ye(r.baseId,c.value),l=Qe(r.baseId,c.value),v=s.useRef(!1),j=s.useRef(!1),y=c.value===r.value;return e.jsxs(e.Fragment,{children:[e.jsx(ie.ItemSlot,{scope:a,value:c.value,children:e.jsx(qe,{asChild:!0,children:e.jsx(T.button,{id:N,disabled:i,"data-disabled":i?"":void 0,"data-state":le(y),"aria-expanded":y,"aria-controls":l,...o,ref:u,onPointerEnter:I(n.onPointerEnter,()=>{j.current=!1,c.wasEscapeCloseRef.current=!1}),onPointerMove:I(n.onPointerMove,B(()=>{i||j.current||c.wasEscapeCloseRef.current||v.current||(r.onTriggerEnter(c.value),v.current=!0)})),onPointerLeave:I(n.onPointerLeave,B(()=>{i||(r.onTriggerLeave(),v.current=!1)})),onClick:I(n.onClick,()=>{r.onItemSelect(c.value),j.current=y}),onKeyDown:I(n.onKeyDown,h=>{const w={horizontal:"ArrowDown",vertical:r.dir==="rtl"?"ArrowLeft":"ArrowRight"}[r.orientation];y&&h.key===w&&(c.onEntryKeyDown(),h.preventDefault())})})})}),y&&e.jsxs(e.Fragment,{children:[e.jsx(cn,{"aria-hidden":!0,tabIndex:0,ref:c.focusProxyRef,onFocus:h=>{const p=c.contentRef.current,w=h.relatedTarget,b=w===d.current,_=p==null?void 0:p.contains(w);(b||!_)&&c.onFocusProxyEnter(b?"start":"end")}}),r.viewport&&e.jsx("span",{"aria-owns":l})]})]})});ze.displayName=ne;var Nn="NavigationMenuLink",ge="navigationMenu.linkSelect",Ge=s.forwardRef((n,t)=>{const{__scopeNavigationMenu:a,active:i,onSelect:o,...r}=n;return e.jsx(qe,{asChild:!0,children:e.jsx(T.a,{"data-active":i?"":void 0,"aria-current":i?"page":void 0,...r,ref:t,onClick:I(n.onClick,c=>{const d=c.target,u=new CustomEvent(ge,{bubbles:!0,cancelable:!0});if(d.addEventListener(ge,N=>o==null?void 0:o(N),{once:!0}),de(d,u),!u.defaultPrevented&&!c.metaKey){const N=new CustomEvent(W,{bubbles:!0,cancelable:!0});de(d,N)}},{checkForDefaultPrevented:!1})})})});Ge.displayName=Nn;var se="NavigationMenuIndicator",He=s.forwardRef((n,t)=>{const{forceMount:a,...i}=n,o=E(se,n.__scopeNavigationMenu),r=!!o.value;return o.indicatorTrack?en.createPortal(e.jsx(q,{present:a||r,children:e.jsx(wn,{...i,ref:t})}),o.indicatorTrack):null});He.displayName=se;var wn=s.forwardRef((n,t)=>{const{__scopeNavigationMenu:a,...i}=n,o=E(se,a),r=Pe(a),[c,d]=s.useState(null),[u,N]=s.useState(null),l=o.orientation==="horizontal",v=!!o.value;s.useEffect(()=>{var p;const h=(p=r().find(w=>w.value===o.value))==null?void 0:p.ref.current;h&&d(h)},[r,o.value]);const j=()=>{c&&N({size:l?c.offsetWidth:c.offsetHeight,offset:l?c.offsetLeft:c.offsetTop})};return oe(c,j),oe(o.indicatorTrack,j),u?e.jsx(T.div,{"aria-hidden":!0,"data-state":v?"visible":"hidden","data-orientation":o.orientation,...i,ref:t,style:{position:"absolute",...l?{left:0,width:u.size+"px",transform:`translateX(${u.offset}px)`}:{top:0,height:u.size+"px",transform:`translateY(${u.offset}px)`},...i.style}}):null}),O="NavigationMenuContent",$e=s.forwardRef((n,t)=>{const{forceMount:a,...i}=n,o=E(O,n.__scopeNavigationMenu),r=Ve(O,n.__scopeNavigationMenu),c=z(r.contentRef,t),d=r.value===o.value,u={value:r.value,triggerRef:r.triggerRef,focusProxyRef:r.focusProxyRef,wasEscapeCloseRef:r.wasEscapeCloseRef,onContentFocusOutside:r.onContentFocusOutside,onRootContentClose:r.onRootContentClose,...i};return o.viewport?e.jsx(Mn,{forceMount:a,...u,ref:c}):e.jsx(q,{present:a||d,children:e.jsx(Ue,{"data-state":le(d),...u,ref:c,onPointerEnter:I(n.onPointerEnter,o.onContentEnter),onPointerLeave:I(n.onPointerLeave,B(o.onContentLeave)),style:{pointerEvents:!d&&o.isRootMenu?"none":void 0,...u.style}})})});$e.displayName=O;var Mn=s.forwardRef((n,t)=>{const a=E(O,n.__scopeNavigationMenu),{onViewportContentChange:i,onViewportContentRemove:o}=a;return Z(()=>{i(n.value,{ref:t,...n})},[n,t,i]),Z(()=>()=>o(n.value),[n.value,o]),null}),W="navigationMenu.rootContentDismiss",Ue=s.forwardRef((n,t)=>{const{__scopeNavigationMenu:a,value:i,triggerRef:o,focusProxyRef:r,wasEscapeCloseRef:c,onRootContentClose:d,onContentFocusOutside:u,...N}=n,l=E(O,a),v=s.useRef(null),j=z(v,t),y=Ye(l.baseId,i),h=Qe(l.baseId,i),p=Pe(a),w=s.useRef(null),{onItemDismiss:b}=l;s.useEffect(()=>{const m=v.current;if(l.isRootMenu&&m){const f=()=>{var g;b(),d(),m.contains(document.activeElement)&&((g=o.current)==null||g.focus())};return m.addEventListener(W,f),()=>m.removeEventListener(W,f)}},[l.isRootMenu,n.value,o,b,d]);const _=s.useMemo(()=>{const f=p().map(S=>S.value);l.dir==="rtl"&&f.reverse();const g=f.indexOf(l.value),M=f.indexOf(l.previousValue),k=i===l.value,P=M===f.indexOf(i);if(!k&&!P)return w.current;const x=(()=>{if(g!==M){if(k&&M!==-1)return g>M?"from-end":"from-start";if(P&&g!==-1)return g>M?"to-start":"to-end"}return null})();return w.current=x,x},[l.previousValue,l.value,l.dir,p,i]);return e.jsx(Be,{asChild:!0,children:e.jsx(on,{id:h,"aria-labelledby":y,"data-motion":_,"data-orientation":l.orientation,...N,ref:j,disableOutsidePointerEvents:!1,onDismiss:()=>{var f;const m=new Event(W,{bubbles:!0,cancelable:!0});(f=v.current)==null||f.dispatchEvent(m)},onFocusOutside:I(n.onFocusOutside,m=>{var g;u();const f=m.target;(g=l.rootNavigationMenu)!=null&&g.contains(f)&&m.preventDefault()}),onPointerDownOutside:I(n.onPointerDownOutside,m=>{var k;const f=m.target,g=p().some(P=>{var x;return(x=P.ref.current)==null?void 0:x.contains(f)}),M=l.isRootMenu&&((k=l.viewport)==null?void 0:k.contains(f));(g||M||!l.isRootMenu)&&m.preventDefault()}),onKeyDown:I(n.onKeyDown,m=>{var M;const f=m.altKey||m.ctrlKey||m.metaKey;if(m.key==="Tab"&&!f){const k=te(m.currentTarget),P=document.activeElement,x=k.findIndex(Je=>Je===P),X=m.shiftKey?k.slice(0,x).reverse():k.slice(x+1,k.length);ue(X)?m.preventDefault():(M=r.current)==null||M.focus()}}),onEscapeKeyDown:I(n.onEscapeKeyDown,m=>{c.current=!0})})})}),ce="NavigationMenuViewport",We=s.forwardRef((n,t)=>{const{forceMount:a,...i}=n,r=!!E(ce,n.__scopeNavigationMenu).value;return e.jsx(q,{present:a||r,children:e.jsx(jn,{...i,ref:t})})});We.displayName=ce;var jn=s.forwardRef((n,t)=>{const{__scopeNavigationMenu:a,children:i,...o}=n,r=E(ce,a),c=z(t,r.onViewportChange),d=pn(O,n.__scopeNavigationMenu),[u,N]=s.useState(null),[l,v]=s.useState(null),j=u?(u==null?void 0:u.width)+"px":void 0,y=u?(u==null?void 0:u.height)+"px":void 0,h=!!r.value,p=h?r.value:r.previousValue;return oe(l,()=>{l&&N({width:l.offsetWidth,height:l.offsetHeight})}),e.jsx(T.div,{"data-state":le(h),"data-orientation":r.orientation,...o,ref:c,style:{pointerEvents:!h&&r.isRootMenu?"none":void 0,"--radix-navigation-menu-viewport-width":j,"--radix-navigation-menu-viewport-height":y,...o.style},onPointerEnter:I(n.onPointerEnter,r.onContentEnter),onPointerLeave:I(n.onPointerLeave,B(r.onContentLeave)),children:Array.from(d.items).map(([b,{ref:_,forceMount:m,...f}])=>{const g=p===b;return e.jsx(q,{present:m||g,children:e.jsx(Ue,{...f,ref:tn(_,M=>{g&&M&&v(M)})})},b)})})}),yn="FocusGroup",Be=s.forwardRef((n,t)=>{const{__scopeNavigationMenu:a,...i}=n,o=E(yn,a);return e.jsx(J.Provider,{scope:a,children:e.jsx(J.Slot,{scope:a,children:e.jsx(T.div,{dir:o.dir,...i,ref:t})})})}),me=["ArrowRight","ArrowLeft","ArrowUp","ArrowDown"],bn="FocusGroupItem",qe=s.forwardRef((n,t)=>{const{__scopeNavigationMenu:a,...i}=n,o=gn(a),r=E(bn,a);return e.jsx(J.ItemSlot,{scope:a,children:e.jsx(T.button,{...i,ref:t,onKeyDown:I(n.onKeyDown,c=>{if(["Home","End",...me].includes(c.key)){let u=o().map(v=>v.ref.current);if([r.dir==="rtl"?"ArrowRight":"ArrowLeft","ArrowUp","End"].includes(c.key)&&u.reverse(),me.includes(c.key)){const v=u.indexOf(c.currentTarget);u=u.slice(v+1)}setTimeout(()=>ue(u)),c.preventDefault()}})})})});function te(n){const t=[],a=document.createTreeWalker(n,NodeFilter.SHOW_ELEMENT,{acceptNode:i=>{const o=i.tagName==="INPUT"&&i.type==="hidden";return i.disabled||i.hidden||o?NodeFilter.FILTER_SKIP:i.tabIndex>=0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});for(;a.nextNode();)t.push(a.currentNode);return t}function ue(n){const t=document.activeElement;return n.some(a=>a===t?!0:(a.focus(),document.activeElement!==t))}function Cn(n){return n.forEach(t=>{t.dataset.tabindex=t.getAttribute("tabindex")||"",t.setAttribute("tabindex","-1")}),()=>{n.forEach(t=>{const a=t.dataset.tabindex;t.setAttribute("tabindex",a)})}}function oe(n,t){const a=D(t);Z(()=>{let i=0;if(n){const o=new ResizeObserver(()=>{cancelAnimationFrame(i),i=window.requestAnimationFrame(a)});return o.observe(n),()=>{window.cancelAnimationFrame(i),o.unobserve(n)}}},[n,a])}function le(n){return n?"open":"closed"}function Ye(n,t){return`${n}-trigger-${t}`}function Qe(n,t){return`${n}-content-${t}`}function B(n){return t=>t.pointerType==="mouse"?n(t):void 0}var In=Se,kn=Oe,Rn=Ke,En=ze,Tn=Ge,_n=He,Ln=$e,Pn=We;function G({className:n,children:t,viewport:a=!0,...i}){return e.jsxs(In,{"data-slot":"navigation-menu","data-viewport":a,className:L("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",n),...i,children:[t,a&&e.jsx(Xe,{})]})}function Q({className:n,...t}){return e.jsx(kn,{"data-slot":"navigation-menu-list",className:L("group flex flex-1 list-none items-center justify-center gap-1",n),...t})}function R({className:n,...t}){return e.jsx(Rn,{"data-slot":"navigation-menu-item",className:L("relative",n),...t})}const Sn=Ee("group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1");function V({className:n,children:t,...a}){return e.jsxs(En,{"data-slot":"navigation-menu-trigger",className:L(Sn(),"group",n),...a,children:[t," ",e.jsx(sn,{className:"relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180","aria-hidden":"true"})]})}function K({className:n,...t}){return e.jsx(Ln,{"data-slot":"navigation-menu-content",className:L("data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto","group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",n),...t})}function Xe({className:n,...t}){return e.jsx("div",{className:L("absolute top-full left-0 isolate z-50 flex justify-center"),children:e.jsx(Pn,{"data-slot":"navigation-menu-viewport",className:L("origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",n),...t})})}const Dn=Ee("data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",{variants:{layout:{default:"flex flex-col gap-1",inline:"inline-flex items-center gap-2"}},defaultVariants:{layout:"default"}});function C({className:n,children:t,layout:a,icon:i,asChild:o=!1,...r}){return e.jsx(Tn,{"data-slot":"navigation-menu-link",className:L(Dn({layout:a}),n),asChild:o,...r,children:o?t:e.jsxs(e.Fragment,{children:[i,t]})})}function Ze({className:n,...t}){return e.jsx(_n,{"data-slot":"navigation-menu-indicator",className:L("data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",n),...t,children:e.jsx("div",{className:"bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md"})})}G.__docgenInfo={description:"",methods:[],displayName:"NavigationMenu",props:{viewport:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}}}};K.__docgenInfo={description:"",methods:[],displayName:"NavigationMenuContent"};Ze.__docgenInfo={description:"",methods:[],displayName:"NavigationMenuIndicator"};R.__docgenInfo={description:"",methods:[],displayName:"NavigationMenuItem"};C.__docgenInfo={description:"",methods:[],displayName:"NavigationMenuLink",props:{layout:{required:!1,tsType:{name:"union",raw:'"default" | "inline"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"inline"'}]},description:""},icon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},asChild:{defaultValue:{value:"false",computed:!1},required:!1}}};Q.__docgenInfo={description:"",methods:[],displayName:"NavigationMenuList"};V.__docgenInfo={description:"",methods:[],displayName:"NavigationMenuTrigger"};Xe.__docgenInfo={description:"",methods:[],displayName:"NavigationMenuViewport"};const Xn={title:"Components/Frame/NavigationMenu",component:G,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{viewport:{control:"boolean",description:"Whether to show the navigation menu viewport"}},decorators:[n=>e.jsx("div",{className:"w-full h-screen flex items-start justify-center pt-20",children:e.jsx("div",{className:"w-full max-w-4xl",children:e.jsx(n,{})})})]},A={render:n=>e.jsx(G,{...n,className:"max-w-none w-full justify-start",children:e.jsxs(Q,{className:"justify-start space-x-4",children:[e.jsx(R,{children:e.jsx(C,{layout:"inline",icon:e.jsx(ae,{}),children:"Home"})}),e.jsxs(R,{children:[e.jsx(V,{children:"Getting Started"}),e.jsx(K,{children:e.jsxs("div",{className:"grid gap-3 p-4 w-[500px] lg:grid-cols-[.75fr_1fr]",children:[e.jsx("div",{className:"row-span-3",children:e.jsx(C,{asChild:!0,children:e.jsxs("a",{className:"flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md",href:"/",children:[e.jsx("div",{className:"mb-2 mt-4 text-lg font-medium",children:"Documentation"}),e.jsx("p",{className:"text-sm leading-tight text-muted-foreground",children:"Learn how to use our platform with comprehensive guides"})]})})}),e.jsx(C,{asChild:!0,children:e.jsxs("a",{className:"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",href:"/",children:[e.jsx("div",{className:"text-sm font-medium leading-none",children:"Introduction"}),e.jsx("p",{className:"line-clamp-2 text-sm leading-snug text-muted-foreground",children:"Learn the basics of our platform"})]})}),e.jsx(C,{asChild:!0,children:e.jsxs("a",{className:"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",href:"/",children:[e.jsx("div",{className:"text-sm font-medium leading-none",children:"Quick Start"}),e.jsx("p",{className:"line-clamp-2 text-sm leading-snug text-muted-foreground",children:"Get up and running in minutes"})]})})]})})]}),e.jsxs(R,{children:[e.jsx(V,{children:"Features"}),e.jsx(K,{children:e.jsx("ul",{className:"grid w-[600px] gap-3 p-4 md:grid-cols-2",children:Fn.map(t=>e.jsx("li",{children:e.jsx(C,{asChild:!0,children:e.jsxs("a",{className:"block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",href:t.href,children:[e.jsxs("div",{className:"flex items-center",children:[t.icon,e.jsx("div",{className:"text-sm font-medium leading-none ml-2",children:t.title})]}),e.jsx("p",{className:"mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground",children:t.description})]})})},t.title))})})]}),e.jsx(R,{children:e.jsx(C,{layout:"inline",icon:e.jsx(Y,{}),children:"Settings"})})]})}),args:{viewport:!0}},H={render:n=>e.jsx(G,{...n,className:"max-w-none w-full justify-start",children:e.jsxs(Q,{className:"justify-start space-x-4",children:[e.jsx(R,{children:e.jsx(C,{layout:"inline",icon:e.jsx(ae,{}),children:"Home"})}),e.jsx(R,{children:e.jsx(C,{layout:"inline",icon:e.jsx(Le,{}),children:"Projects"})}),e.jsx(R,{children:e.jsx(C,{layout:"inline",icon:e.jsx(_e,{}),children:"Schedule"})}),e.jsx(R,{children:e.jsx(C,{layout:"inline",icon:e.jsx(Y,{}),children:"Settings"})})]})}),args:{viewport:!1}},$={render:n=>e.jsxs(G,{...n,className:"max-w-none w-full justify-start",children:[e.jsxs(Q,{className:"justify-start space-x-4",children:[e.jsxs(R,{children:[e.jsx(V,{children:"Products"}),e.jsx(K,{children:e.jsxs("ul",{className:"grid gap-3 p-6 w-[500px] lg:grid-cols-[.75fr_1fr]",children:[e.jsx("li",{className:"row-span-3",children:e.jsx(C,{asChild:!0,children:e.jsxs("a",{className:"flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md",href:"/",children:[e.jsx("div",{className:"mb-2 mt-4 text-lg font-medium",children:"Featured Products"}),e.jsx("p",{className:"text-sm leading-tight text-muted-foreground",children:"Check out our latest product offerings"})]})})}),e.jsx("li",{children:e.jsx(C,{asChild:!0,children:e.jsxs("a",{className:"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",href:"/",children:[e.jsx("div",{className:"text-sm font-medium leading-none",children:"Product A"}),e.jsx("p",{className:"line-clamp-2 text-sm leading-snug text-muted-foreground",children:"Our flagship product"})]})})}),e.jsx("li",{children:e.jsx(C,{asChild:!0,children:e.jsxs("a",{className:"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",href:"/",children:[e.jsx("div",{className:"text-sm font-medium leading-none",children:"Product B"}),e.jsx("p",{className:"line-clamp-2 text-sm leading-snug text-muted-foreground",children:"Our newest offering"})]})})})]})})]}),e.jsxs(R,{children:[e.jsx(V,{children:"Services"}),e.jsx(K,{children:e.jsx("ul",{className:"grid w-[500px] gap-3 p-4 md:grid-cols-2",children:On.map(t=>e.jsx("li",{children:e.jsx(C,{asChild:!0,children:e.jsxs("a",{className:"block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",href:"/",children:[e.jsx("div",{className:"text-sm font-medium leading-none",children:t.title}),e.jsx("p",{className:"mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground",children:t.description})]})})},t.title))})})]}),e.jsx(R,{children:e.jsx(C,{layout:"inline",icon:e.jsx(Y,{}),children:"Contact"})})]}),e.jsx(Ze,{})]}),args:{viewport:!0}},U={...A,args:{viewport:!1}},Fn=[{title:"Dashboard",description:"View your analytics and monitor key metrics",href:"/",icon:e.jsx(ae,{className:"h-4 w-4"})},{title:"Documents",description:"Manage and organize your documents",href:"/",icon:e.jsx(Le,{className:"h-4 w-4"})},{title:"Calendar",description:"Schedule and manage your events",href:"/",icon:e.jsx(_e,{className:"h-4 w-4"})},{title:"Settings",description:"Configure your account and application settings",href:"/",icon:e.jsx(Y,{className:"h-4 w-4"})}],On=[{title:"Consulting",description:"Expert advice to help grow your business"},{title:"Implementation",description:"Professional setup and integration services"},{title:"Training",description:"Learn how to get the most from our platform"},{title:"Support",description:"24/7 assistance for all your needs"}];var fe,ve,pe;A.parameters={...A.parameters,docs:{...(fe=A.parameters)==null?void 0:fe.docs,source:{originalSource:`{
  render: args => <NavigationMenu {...args} className="max-w-none w-full justify-start">
      <NavigationMenuList className="justify-start space-x-4">
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<HomeIcon />}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[500px] lg:grid-cols-[.75fr_1fr]">
              <div className="row-span-3">
                <NavigationMenuLink asChild>
                  <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md" href="/">
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Documentation
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Learn how to use our platform with comprehensive guides
                    </p>
                  </a>
                </NavigationMenuLink>
              </div>
              <NavigationMenuLink asChild>
                <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href="/">
                  <div className="text-sm font-medium leading-none">Introduction</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Learn the basics of our platform
                  </p>
                </a>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href="/">
                  <div className="text-sm font-medium leading-none">Quick Start</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Get up and running in minutes
                  </p>
                </a>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
              {features.map(feature => <li key={feature.title}>
                  <NavigationMenuLink asChild>
                    <a className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href={feature.href}>
                      <div className="flex items-center">
                        {feature.icon}
                        <div className="text-sm font-medium leading-none ml-2">{feature.title}</div>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {feature.description}
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>)}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<SettingsIcon />}>
            Settings
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
  args: {
    viewport: true
  }
}`,...(pe=(ve=A.parameters)==null?void 0:ve.docs)==null?void 0:pe.source}}};var xe,he,Ne;H.parameters={...H.parameters,docs:{...(xe=H.parameters)==null?void 0:xe.docs,source:{originalSource:`{
  render: args => <NavigationMenu {...args} className="max-w-none w-full justify-start">
      <NavigationMenuList className="justify-start space-x-4">
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<HomeIcon />}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<FolderIcon />}>
            Projects
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<CalendarIcon />}>
            Schedule
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<SettingsIcon />}>
            Settings
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
  args: {
    viewport: false
  }
}`,...(Ne=(he=H.parameters)==null?void 0:he.docs)==null?void 0:Ne.source}}};var we,Me,je;$.parameters={...$.parameters,docs:{...(we=$.parameters)==null?void 0:we.docs,source:{originalSource:`{
  render: args => <NavigationMenu {...args} className="max-w-none w-full justify-start">
      <NavigationMenuList className="justify-start space-x-4">
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md" href="/">
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Featured Products
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Check out our latest product offerings
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href="/">
                    <div className="text-sm font-medium leading-none">Product A</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Our flagship product
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href="/">
                    <div className="text-sm font-medium leading-none">Product B</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Our newest offering
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
              {services.map(service => <li key={service.title}>
                  <NavigationMenuLink asChild>
                    <a className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href="/">
                      <div className="text-sm font-medium leading-none">{service.title}</div>
                      <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {service.description}
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>)}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<SettingsIcon />}>
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
    </NavigationMenu>,
  args: {
    viewport: true
  }
}`,...(je=(Me=$.parameters)==null?void 0:Me.docs)==null?void 0:je.source}}};var ye,be,Ce;U.parameters={...U.parameters,docs:{...(ye=U.parameters)==null?void 0:ye.docs,source:{originalSource:`{
  ...Default,
  args: {
    viewport: false
  }
}`,...(Ce=(be=U.parameters)==null?void 0:be.docs)==null?void 0:Ce.source}}};const Zn=["Default","SimpleMenu","WithIndicator","NoViewport"];export{A as Default,U as NoViewport,H as SimpleMenu,$ as WithIndicator,Zn as __namedExportsOrder,Xn as default};
