import { NextResponse } from "next/server";
import { printavoRequest } from "@/lib/printavo";

export async function POST(request: Request) {
  const testCustomerId = process.env.PRINTAVO_TEST_CUSTOMER_ID;
  if (!testCustomerId) return NextResponse.json({ success:false, error:"Missing PRINTAVO_TEST_CUSTOMER_ID." }, { status:500 });
  const order = await request.json();
  try {
    const customerData = await printavoRequest({query:`query($id: ID!){customer(id:$id){id companyName primaryContact{id fullName email phone}}}`, variables:{id:testCustomerId}});
    const customer = customerData.customer;
    const item = order.order || {}, pricing = order.pricing || {};
    const quantity = Number(item.quantity || 1), subtotal = Number(pricing.subtotal || 0), shippingTotal = Number(pricing.shippingTotal || 0), grandTotal = Number(pricing.grandTotal || subtotal + shippingTotal);
    const unit = quantity > 0 ? Number((subtotal/quantity).toFixed(4)) : subtotal;
    const customerDueAt = item.neededBy || new Date(Date.now()+14*24*60*60*1000).toISOString().slice(0,10);
    const quoteData = await printavoRequest({query:`mutation($input: QuoteCreateInput!){quoteCreate(input:$input){id nickname publicUrl publicPdf subtotal total customerDueAt dueAt}}`, variables:{input:{contact:{id:customer.primaryContact.id},nickname:`GORILLA ORDER TEST - ${quantity} ${item.shape||""} Stickers`,customerDueAt,dueAt:`${customerDueAt}T17:00:00Z`,customerNote:["GORILLA ORDER TEST QUOTE",`Product: ${item.product||"Custom Stickers"}`,`Quantity: ${quantity}`,`Shape: ${item.shape||""}`,`Size: ${item.size||""}`,`Material: ${item.material||""}`,`Finish: ${item.finish||""}`,`Grand Total From Website: ${grandTotal}`,`Customer: ${order?.customer?.name||""} ${order?.customer?.email||""}`,`Notes: ${item.notes||""}`].join("\n"),productionNote:"Created by Gorilla Order v1 alpha.",tags:["#GorillaOrder","#WebsiteTest","#Stickers"]}}});
    const quote = quoteData.quoteCreate;
    await printavoRequest({query:`mutation($parentId: ID!, $input: LineItemGroupCreateInput!){lineItemGroupCreate(parentId:$parentId,input:$input){id}}`, variables:{parentId:quote.id,input:{position:1,lineItems:[{description:`${quantity} ${item.shape||""} Stickers\n${item.size||""} / ${item.material||""} / ${item.finish||""}`,itemNumber:"GORILLA-STICKER",position:1,price:unit,sizes:[{size:"size_other",count:quantity}],taxed:true},{description:`${pricing.shippingMethod||"Shipping"} - Shipping / Pickup`,itemNumber:"GORILLA-SHIPPING",position:2,price:shippingTotal,sizes:[{size:"size_other",count:1}],taxed:false}]}}});
    const refreshed = await printavoRequest({query:`query($id: ID!){quote(id:$id){id nickname publicUrl publicPdf subtotal total customerDueAt dueAt}}`, variables:{id:quote.id}});
    return NextResponse.json({success:true,message:"Quote created in Printavo.",quote:refreshed.quote,websiteTotals:{subtotal,shippingTotal,grandTotal,unit}});
  } catch(error) {
    return NextResponse.json({success:false,message:"Printavo quote creation failed.",error}, {status:500});
  }
}
