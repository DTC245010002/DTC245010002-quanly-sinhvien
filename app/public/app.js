const cfg = {
  classes:  { cols: ['id','name','teacher'], form: ['name','teacher'] },
  students: { cols: ['id','student_code','full_name','email','class_name'], form: ['student_code','full_name','email','class_id'] },
  grades:   { cols: ['id','student_code','full_name','subject','score'], form: ['student_id','subject','score'] }
};
let tab = 'classes', editId = null, rows = [];
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

async function api(method, url, body) {
  const r = await fetch(url, { method, headers: {'Content-Type':'application/json'},
    body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) { alert('Lỗi: ' + await r.text()); return null; }
  return r.status === 204 ? true : r.json();
}

async function load() {
  const c = cfg[tab]; editId = null;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('#form').innerHTML = c.form.map(f => `<input name="${f}" placeholder="${f}">`).join('') + '<button>Lưu</button>';
  rows = await api('GET', '/api/' + tab) || [];
  $('#table').innerHTML = '<tr>' + c.cols.map(x => `<th>${x}</th>`).join('') + '<th></th></tr>' +
    rows.map(r => '<tr>' + c.cols.map(x => `<td>${esc(r[x])}</td>`).join('') +
      `<td><button data-edit="${r.id}">Sửa</button><button data-del="${r.id}">Xóa</button></td></tr>`).join('');
}

document.querySelector('nav').onclick = e => { if (e.target.dataset.tab) { tab = e.target.dataset.tab; load(); } };
$('#form').onsubmit = async e => {
  e.preventDefault();
  const body = {};
  cfg[tab].form.forEach(f => { const v = e.target[f].value.trim(); body[f] = v === '' ? null : v; });
  const ok = editId ? await api('PUT', `/api/${tab}/${editId}`, body) : await api('POST', '/api/' + tab, body);
  if (ok) load();
};
$('#table').onclick = async e => {
  const { edit, del } = e.target.dataset;
  if (del && confirm('Xóa bản ghi này?')) { if (await api('DELETE', `/api/${tab}/${del}`)) load(); }
  if (edit) {
    const r = rows.find(x => x.id == edit); editId = edit;
    cfg[tab].form.forEach(f => { $('#form')[f].value = r[f] ?? ''; });
  }
};
load();
