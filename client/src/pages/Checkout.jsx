import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Checkout(){
  const { user } = useAuth();
  const [address,setAddress]=useState('');
  const [payment,setPayment]=useState('card');
  const nav = useNavigate();
  const place = async ()=>{
    try{
      await api.post('/orders', { userId: user.id, address, paymentMethod: payment });
      alert('Order placed');
      nav('/orders');
    }catch(err){ alert('Error placing order'); }
  };
  return (
    <div className="row">
      <div className="col-md-6">
        <h4>Shipping Address</h4>
        <textarea className="form-control mb-3" value={address} onChange={e=>setAddress(e.target.value)}/>
        <h4>Payment</h4>
        <select className="form-control mb-3" value={payment} onChange={e=>setPayment(e.target.value)}>
          <option value="card">Card</option>
          <option value="paypal">PayPal</option>
        </select>
        <button className="btn btn-primary" onClick={place}>Place Order</button>
      </div>
    </div>
  )
}
