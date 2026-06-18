import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useParams, useNavigate } from 'react-router-dom'

export default function EditProduct(){
  const { id } = useParams();
  const [form,setForm]=useState(null);
  const nav = useNavigate();
  useEffect(()=>{ api.get(`/products/${id}`).then(r=>setForm(r.data)); },[id]);
  const submit = async e => { e.preventDefault(); await api.put(`/products/${id}`, form); alert('Updated'); nav('/admin'); };
  if(!form) return <div>Loading...</div>
  return (
    <div>
      <h3>Edit Product</h3>
      <form onSubmit={submit}>
        <input className="form-control mb-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
        <textarea className="form-control mb-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <input className="form-control mb-2" placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
        <input type="number" className="form-control mb-2" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} />
        <input type="number" className="form-control mb-2" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:Number(e.target.value)})} />
        <input type="number" className="form-control mb-2" placeholder="Discount" value={form.discount} onChange={e=>setForm({...form,discount:Number(e.target.value)})} />
        <button className="btn btn-primary">Save</button>
      </form>
    </div>
  )
}
