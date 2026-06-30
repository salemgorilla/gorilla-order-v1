import stickerData from "@/data/stickers.json";
export function money(value:number){return "$"+value.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});}
export function getOption<T extends {id:string}>(list:T[],id:string):T{const item=list.find(x=>x.id===id);if(!item)throw new Error("Missing option "+id);return item;}
export function calculate(state:{shape:string;size:string;material:string;finish:string;quantity:number;shipping:string}){
 const shape=getOption(stickerData.shapes,state.shape), size=getOption(stickerData.sizes,state.size), material=getOption(stickerData.materials,state.material), finish=getOption(stickerData.finishes,state.finish), shipping=getOption(stickerData.shipping,state.shipping);
 const base=Number(size.base[String(state.quantity) as keyof typeof size.base]||0);
 const subtotal=Math.round(base*shape.multiplier*material.multiplier*finish.multiplier);
 let shippingTotal=0;
 if(shipping.type==="flat") shippingTotal=Number(shipping.price||0);
 else { const tier=shipping.tiers?.find(t=>t.max===null||subtotal<=Number(t.max)); shippingTotal=Number(tier?.price||0); }
 return {shape,size,material,finish,shipping,subtotal,shippingTotal,grandTotal:subtotal+shippingTotal,unitPrice:(subtotal+shippingTotal)/state.quantity};
}
export {stickerData};
