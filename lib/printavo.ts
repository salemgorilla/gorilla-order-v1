export async function printavoRequest({query,variables}:{query:string;variables?:Record<string,unknown>}){
 const email=process.env.PRINTAVO_EMAIL, token=process.env.PRINTAVO_TOKEN;
 if(!email||!token) throw new Error("Missing Printavo credentials.");
 const response=await fetch("https://www.printavo.com/api/v2",{method:"POST",headers:{"Content-Type":"application/json",email,token},body:JSON.stringify({query,variables})});
 const data=await response.json();
 if(!response.ok||data.errors) throw {status:response.status,data};
 return data.data;
}
