import React, { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function AddProduct(){
  const [form,setForm]=useState({ name:'', description:'', category:'', price:0, stock:0, discount:0 });
  const nav = useNavigate();
  const submit = async e => { e.preventDefault(); await api.post('/products', form); alert('Product added'); nav('/admin'); };
  return (
    <div>
      <h3>Add Product</h3>
      <form onSubmit={submit}>
        <input className="form-control mb-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
        <textarea className="form-control mb-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <input className="form-control mb-2" placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
        <input type="number" className="form-control mb-2" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} />
        <input type="number" className="form-control mb-2" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:Number(e.target.value)})} />
        <input type="number" className="form-control mb-2" placeholder="Discount" value={form.discount} onChange={e=>setForm({...form,discount:Number(e.target.value)})} />
        <button className="btn btn-primary">Add</button>
      </form>
    </div>
  )
}
