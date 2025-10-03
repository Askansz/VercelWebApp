async function load() {
const res = await fetch('/api/load');
if (!res.ok) return console.error('Failed to load');
const rows = await res.json();
const list = document.getElementById('list');
list.innerHTML = rows.map(r => `<li><div>${escapeHtml(r.content)}</div><small>${new Date(r.created_at).toLocaleString()}</small></li>`).join('');
}


function escapeHtml(s){
return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}


document.getElementById('saveForm').addEventListener('submit', async (e)=>{
e.preventDefault();
const content = document.getElementById('content').value.trim();
if (!content) return alert('Enter text');
const res = await fetch('/api/save',{
method:'POST',
headers:{'Content-Type':'application/json'},
body: JSON.stringify({ content })
});
if (!res.ok) return alert('Save failed');
document.getElementById('content').value = '';
load();
});


load();
