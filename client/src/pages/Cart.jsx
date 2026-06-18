import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Link, useNavigate } from 'react-router-dom'

export default function Cart(){
  const { user } = useAuth();
  const [cart,setCart]=useState(null);
  const nav = useNavigate();
  useEffect(()=>{ if(user) fetch(); },[user]);
  const fetch = async ()=>{ const res = await api.get(`/cart/${user.id}`); setCart(res.data); };
  const updateQty = async (pid, q)=>{ await api.put('/cart/update', { userId: user.id, productId: pid, quantity: q }); fetch(); };
  const remove = async pid=>{ await api.delete('/cart/remove', { data: { userId: user.id, productId: pid } }); fetch(); };
  const checkout = ()=> nav('/checkout');
  if(!cart) return <div>Loading...</div>
  const total = cart.products.reduce((s,p)=>s + p.quantity * (p.productId.price || 0), 0);
  return (
    <div>
      <h3>Your Cart</h3>
      {cart.products.length===0 ? <p>Cart empty</p> : (
        <div>
          {cart.products.map(p=> (
            <div className="d-flex align-items-center mb-3" key={p.productId._id}>
              <div className="me-3">{p.productId.name}</div>
              <div className="me-3">${p.productId.price}</div>
              <input type="number" value={p.quantity} onChange={e=>updateQty(p.productId._id, Number(e.target.value))} style={{width:80}}/>
              <button className="btn btn-sm btn-danger ms-3" onClick={()=>remove(p.productId._id)}>Remove</button>
            </div>
          ))}
          <h5>Total: ${total.toFixed(2)}</h5>
          <button className="btn btn-primary" onClick={checkout}>Proceed to Checkout</button>
        </div>
      )}
    </div>
  )
}
