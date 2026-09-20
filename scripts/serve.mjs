import http from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=await realpath(fileURLToPath(new URL('../',import.meta.url)));
const port=Number(process.env.RPG_PORT||8000);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
 try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let target=path.resolve(root,'.'+pathname);
 if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
 if((await stat(target)).isDirectory())target=path.join(target,'index.html');
 target=await realpath(target);
 if(!target.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
 const data=await readFile(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
 }catch(error){res.writeHead(error instanceof URIError?400:404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Grand Line Origins: http://127.0.0.1:${port}`));
