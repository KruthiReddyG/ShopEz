import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function AdminDashboard(){
  const [users,setUsers]=useState([]);
  const [orders,setOrders]=useState([]);
  const [products,setProducts]=useState([]);
  useEffect(()=>{ fetchAll(); },[]);
  const fetchAll = async ()=>{
    const u = await api.get('/admin/users'); setUsers(u.data);
    const o = await api.get('/admin/orders'); setOrders(o.data);
    const p = await api.get('/products'); setProducts(p.data);
  };
  return (
    <div>
      <h3>Admin Dashboard</h3>
      <div className="mb-4">
        <h5>Users</h5>
        {users.map(u=> <div key={u._id}>{u.name} - {u.email} - {u.role}</div>)}
      </div>
      <div className="mb-4">
        <h5>Products <Link className="btn btn-sm btn-primary ms-2" to="/admin/add">Add Product</Link></h5>
        {products.map(p=> <div key={p._id}>{p.name} - ${p.price} - <Link to={`/admin/edit/${p._id}`}>Edit</Link></div>)}
      </div>
      <div>
        <h5>Orders</h5>
        {orders.map(o=> <div key={o._id}>{o._id} - {o.userId?.email || ''} - {o.status}</div>)}
      </div>
    </div>
  )
}
