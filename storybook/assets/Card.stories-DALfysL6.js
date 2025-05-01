import{j as e}from"./jsx-runtime-DiklIkkE.js";import{B as i}from"./LinkButton-Cya8ejw6.js";import{c as o}from"./utils-D64OaFpV.js";import{c as R}from"./createLucideIcon-DgdrlRR4.js";import"./index-DRjF_FHU.js";import"./index-DCfoyVzz.js";import"./bundle-mjs-BTGVH9Kg.js";import"./index-Bx0Ph3cE.js";import"./tiny-invariant-CopsF_GD.js";import"./index-C2sCW7CK.js";/**
 * @license lucide-react v0.503.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]],W=R("ellipsis",q);function c({className:r,...a}){return e.jsx("div",{"data-slot":"card",className:o("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",r),...a})}function s({className:r,...a}){return e.jsx("div",{"data-slot":"card-header",className:o("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",r),...a})}function t({className:r,...a}){return e.jsx("div",{"data-slot":"card-title",className:o("leading-none font-semibold",r),...a})}function d({className:r,...a}){return e.jsx("div",{"data-slot":"card-description",className:o("text-muted-foreground text-sm",r),...a})}function g({className:r,...a}){return e.jsx("div",{"data-slot":"card-action",className:o("col-start-2 row-span-2 row-start-1 self-start justify-self-end",r),...a})}function n({className:r,...a}){return e.jsx("div",{"data-slot":"card-content",className:o("px-6",r),...a})}function l({className:r,...a}){return e.jsx("div",{"data-slot":"card-footer",className:o("flex items-center px-6 [.border-t]:pt-6",r),...a})}c.__docgenInfo={description:"",methods:[],displayName:"Card"};g.__docgenInfo={description:"",methods:[],displayName:"CardAction"};n.__docgenInfo={description:"",methods:[],displayName:"CardContent"};d.__docgenInfo={description:"",methods:[],displayName:"CardDescription"};l.__docgenInfo={description:"",methods:[],displayName:"CardFooter"};s.__docgenInfo={description:"",methods:[],displayName:"CardHeader"};t.__docgenInfo={description:"",methods:[],displayName:"CardTitle"};const $={title:"Components/Card",component:c,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{className:{control:"text",description:"Additional CSS classes to apply to the card"}}},m={args:{className:"w-[350px]",children:e.jsxs(e.Fragment,{children:[e.jsxs(s,{children:[e.jsx(t,{children:"Card Title"}),e.jsx(d,{children:"Card description goes here"})]}),e.jsx(n,{children:e.jsx("p",{children:"This is the main content of the card."})}),e.jsx(l,{children:e.jsx(i,{size:"sm",children:"Action"})})]})}},h={args:{className:"w-[350px]",children:e.jsxs(e.Fragment,{children:[e.jsxs(s,{children:[e.jsx(t,{children:"Card with Action"}),e.jsx(d,{children:"Card with an action button in the header"}),e.jsx(g,{children:e.jsx(i,{variant:"ghost",size:"icon",colorscheme:"secondary",children:e.jsx(W,{className:"h-5 w-5"})})})]}),e.jsx(n,{children:e.jsx("p",{children:"This card has an action button in the header."})}),e.jsx(l,{children:e.jsx(i,{size:"sm",children:"Action"})})]})}},p={args:{className:"w-[350px]",children:e.jsx(n,{children:e.jsx("p",{children:"This card has only content without header or footer."})})}},C={args:{className:"w-[350px]",children:e.jsxs(e.Fragment,{children:[e.jsxs(s,{children:[e.jsx(t,{children:"Card Title"}),e.jsx(d,{children:"Card with header and content"})]}),e.jsx(n,{children:e.jsx("p",{children:"This card has a header and content but no footer."})})]})}},x={args:{className:"w-[350px]",children:e.jsxs(e.Fragment,{children:[e.jsx(n,{children:e.jsx("p",{children:"This card has content and a footer but no header."})}),e.jsx(l,{children:e.jsx(i,{size:"sm",children:"Action"})})]})}},u={render:()=>e.jsxs("div",{className:"flex flex-col space-y-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-2",children:"Small Card (w-64)"}),e.jsxs(c,{className:"w-64",children:[e.jsxs(s,{children:[e.jsx(t,{children:"Small Card"}),e.jsx(d,{children:"A card with small width"})]}),e.jsx(n,{children:e.jsx("p",{children:"This is a small card."})})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-2",children:"Medium Card (w-80)"}),e.jsxs(c,{className:"w-80",children:[e.jsxs(s,{children:[e.jsx(t,{children:"Medium Card"}),e.jsx(d,{children:"A card with medium width"})]}),e.jsx(n,{children:e.jsx("p",{children:"This is a medium-sized card."})})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-2",children:"Large Card (w-96)"}),e.jsxs(c,{className:"w-96",children:[e.jsxs(s,{children:[e.jsx(t,{children:"Large Card"}),e.jsx(d,{children:"A card with large width"})]}),e.jsx(n,{children:e.jsx("p",{children:"This is a large card with more space for content."})})]})]})]})},j={render:()=>e.jsxs(c,{className:"w-[400px]",children:[e.jsxs(s,{children:[e.jsx(t,{children:"Complex Card Example"}),e.jsx(d,{children:"A more complex card layout with multiple sections"}),e.jsx(g,{children:e.jsx(i,{variant:"ghost",size:"icon",colorscheme:"secondary",children:e.jsx(W,{className:"h-5 w-5"})})})]}),e.jsxs(n,{className:"space-y-4",children:[e.jsxs("div",{className:"rounded-lg bg-secondary/20 p-4",children:[e.jsx("h3",{className:"font-medium mb-2",children:"Featured Content"}),e.jsx("p",{className:"text-sm",children:"This is a highlighted section within the card content area."})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("h3",{className:"font-medium",children:"Details"}),e.jsxs("ul",{className:"text-sm space-y-1",children:[e.jsx("li",{children:"First item details"}),e.jsx("li",{children:"Second item with more information"}),e.jsx("li",{children:"Third item with extra details"})]})]})]}),e.jsxs(l,{className:"justify-between",children:[e.jsx(i,{variant:"outline",size:"sm",children:"Cancel"}),e.jsx(i,{size:"sm",children:"Continue"})]})]})};var w,N,f;m.parameters={...m.parameters,docs:{...(w=m.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    className: "w-[350px]",
    children: <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content of the card.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </>
  }
}`,...(f=(N=m.parameters)==null?void 0:N.docs)==null?void 0:f.source}}};var y,T,v;h.parameters={...h.parameters,docs:{...(y=h.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    className: "w-[350px]",
    children: <>
        <CardHeader>
          <CardTitle>Card with Action</CardTitle>
          <CardDescription>
            Card with an action button in the header
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon" colorscheme="secondary">
              <MoreHorizontalIcon className="h-5 w-5" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>This card has an action button in the header.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </>
  }
}`,...(v=(T=h.parameters)==null?void 0:T.docs)==null?void 0:v.source}}};var A,b,z;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    className: "w-[350px]",
    children: <CardContent>
        <p>This card has only content without header or footer.</p>
      </CardContent>
  }
}`,...(z=(b=p.parameters)==null?void 0:b.docs)==null?void 0:z.source}}};var D,F,H;C.parameters={...C.parameters,docs:{...(D=C.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    className: "w-[350px]",
    children: <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card with header and content</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card has a header and content but no footer.</p>
        </CardContent>
      </>
  }
}`,...(H=(F=C.parameters)==null?void 0:F.docs)==null?void 0:H.source}}};var _,S,B;x.parameters={...x.parameters,docs:{...(_=x.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    className: "w-[350px]",
    children: <>
        <CardContent>
          <p>This card has content and a footer but no header.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </>
  }
}`,...(B=(S=x.parameters)==null?void 0:S.docs)==null?void 0:B.source}}};var I,M,E;u.parameters={...u.parameters,docs:{...(I=u.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Small Card (w-64)</p>
        <Card className="w-64">
          <CardHeader>
            <CardTitle>Small Card</CardTitle>
            <CardDescription>A card with small width</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a small card.</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Medium Card (w-80)</p>
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Medium Card</CardTitle>
            <CardDescription>A card with medium width</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a medium-sized card.</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Large Card (w-96)</p>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Large Card</CardTitle>
            <CardDescription>A card with large width</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a large card with more space for content.</p>
          </CardContent>
        </Card>
      </div>
    </div>
}`,...(E=(M=u.parameters)==null?void 0:M.docs)==null?void 0:E.source}}};var L,k,O;j.parameters={...j.parameters,docs:{...(L=j.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Complex Card Example</CardTitle>
        <CardDescription>
          A more complex card layout with multiple sections
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon" colorscheme="secondary">
            <MoreHorizontalIcon className="h-5 w-5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-secondary/20 p-4">
          <h3 className="font-medium mb-2">Featured Content</h3>
          <p className="text-sm">
            This is a highlighted section within the card content area.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">Details</h3>
          <ul className="text-sm space-y-1">
            <li>First item details</li>
            <li>Second item with more information</li>
            <li>Third item with extra details</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Continue</Button>
      </CardFooter>
    </Card>
}`,...(O=(k=j.parameters)==null?void 0:k.docs)==null?void 0:O.source}}};const ee=["Default","WithAction","ContentOnly","HeaderAndContent","ContentAndFooter","CardSizes","ComplexCard"];export{u as CardSizes,j as ComplexCard,x as ContentAndFooter,p as ContentOnly,m as Default,C as HeaderAndContent,h as WithAction,ee as __namedExportsOrder,$ as default};
