# PhishItOut - ITSC 4155 Software Development Project  
## By Jack Stewart, Alex Hludzinski, Kody Sriwudhthanun, Erich Then, and Manoah Allen

### Description and additional documentation and usage details will be added

#### Changes needed to be made to the backend currently: 

**server.js**  
- PORT = 3000 is hardcoded (Render assigns its own port via process.env.PORT).
- No trust proxy setting (rate limiter behind Render's proxy will misidentify IPs).
- No static file serving for the frontend.
- dotenv is now required — which means a .env file with VT_API_KEY is expected locally. Render handles this   
differently — we set env vars in the dashboard, no .env file.

**script.js**  
- removed hardcoded local host 
- guard event listener on urlInput, same crash on report.html and learn.html
- rm stale loadReports() function 

**db.js**
- uses ./reports.db which is relative to cwd. Needs path.join(__dirname, ...).


#### Frontend

**script.js**
- set API_BASE to an empty string so it uses same-origin (works both local and deployed)

**index.html**
- add hidden class to vtResults before results