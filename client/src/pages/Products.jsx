import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function Products(){
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  useEffect(()=>{ fetch(); },[]);
  const fetch = async () => { const res = await api.get('/products'); setProducts(res.data); };
  const search = async e => { e.preventDefault(); const res = await api.get(`/products?q=${q}`); setProducts(res.data); };
  return (
    <div>
      <h3>Products</h3>
      <form onSubmit={search} className="mb-3 d-flex">
        <input className="form-control me-2" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)}/>
        <button className="btn btn-outline-primary">Search</button>
      </form>
      <div className="row">
        {products.map(p=> (
          <div className="col-md-4" key={p._id}>
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text">${p.price}</p>
                <Link to={`/products/${p._id}`} className="btn btn-sm btn-primary">View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
