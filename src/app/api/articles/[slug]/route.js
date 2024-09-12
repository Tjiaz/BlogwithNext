import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();



export async function GET(req,{params}) {
  const slug = params
  
  try {
    // Find article by topic 
    const article  = await prisma.article.findFirst({ 
      where :{topic:slug},
      include : {
        
        content:true // include related content
      
      }
    })
  if(!article) { 
    return new Response(JSON.stringify({ 
      error:"Article Not Found"
    }, {status:404}))

  return new Response(
    JSON.stringify(article), {status: 200})
  
  }
   

 }  catch (error) {
  return new Response(JSON.stringify({ error: 'Failed to fetch article' }), {
    status: 500,
  });
}
}