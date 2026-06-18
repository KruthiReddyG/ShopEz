import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ProductDetails(){
  const { id } = useParams();
  const [product,setProduct]=useState(null);
  const [qty,setQty]=useState(1);
  const { user } = useAuth();
  const nav = useNavigate();
  useEffect(()=>{ api.get(`/products/${id}`).then(r=>setProduct(r.data)).catch(()=>{}); },[id]);
  const add = async ()=>{
    if(!user){ nav('/login'); return; }
    await api.post('/cart/add', { userId: user.id, productId: id, quantity: qty });
    alert('Added to cart');
    nav('/cart');
  };
  if(!product) return <div>Loading...</div>
  return (
    <div className="row">
      <div className="col-md-6">
        <div className="border p-3">Image placeholder</div>
      </div>
      <div className="col-md-6">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <p>Price: ${product.price}</p>
        <div className="d-flex align-items-center">
          <input type="number" className="form-control me-2" style={{width:100}} value={qty} onChange={e=>setQty(Number(e.target.value))} min={1}/>
          <button className="btn btn-primary" onClick={add}>Add To Cart</button>
        </div>
      </div>
    </div>
  )
}
