import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Orders(){
  const { user } = useAuth();
  const [orders,setOrders]=useState([]);
  useEffect(()=>{ if(user) api.get(`/orders/${user.id}`).then(r=>setOrders(r.data)); },[user]);
  return (
    <div>
      <h3>Orders</h3>
      {orders.map(o=> (
        <div className="card mb-2" key={o._id}>
          <div className="card-body">
            <h5>Order {o._id}</h5>
            <p>Status: {o.status}</p>
            <p>Total: ${o.totalPrice}</p>
            <p>Created: {new Date(o.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
