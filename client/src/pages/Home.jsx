import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function Home(){
  const [products, setProducts] = useState([]);
  useEffect(()=>{ api.get('/products').then(r=>setProducts(r.data)).catch(()=>{}); },[]);
  return (
    <div>
      <div className="p-5 mb-4 bg-light rounded-3">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">ShopEZ</h1>
          <p className="col-md-8 fs-4">A simple MERN e-commerce demo.</p>
          <Link className="btn btn-primary btn-lg" to="/products">Shop Now</Link>
        </div>
      </div>

      <h3>Featured Products</h3>
      <div className="row">
        {products.slice(0,6).map(p=> (
          <div className="col-md-4" key={p._id}>
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text">{p.description}</p>
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
