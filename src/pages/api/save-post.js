import fs from 'fs';
import path from 'path';

export const prerender = false;

export async function POST({ request }) {
  console.log('=== API HIT ===');
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Get raw text first to debug
    const rawBody = await request.text();
    console.log('Raw body length:', rawBody.length);
    console.log('Raw body:', rawBody);
    
    if (!rawBody || rawBody.length === 0) {
      console.log('Empty request body!');
      return new Response(JSON.stringify({ error: 'Empty request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse JSON
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Parsed data:', data);
    const { filename, content } = data;
    
    if (!filename || !content) {
      return new Response(JSON.stringify({ error: 'Missing filename or content' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const safeName = filename.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const filePath = path.join(process.cwd(), 'src', 'content', 'posts', `${safeName}.md`);
    
    console.log('Saving to:', filePath);
    
    // Make sure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('File saved successfully!');
    
    return new Response(JSON.stringify({ 
      success: true, 
      filename: `${safeName}.md` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('=== API ERROR ===', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
