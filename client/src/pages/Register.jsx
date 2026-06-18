import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register(){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const { register } = useAuth();
  const nav = useNavigate();
  const submit = async e => { e.preventDefault(); try{ await register(name,email,password); nav('/'); }catch(err){ alert('Register failed'); } };
  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3>Register</h3>
        <form onSubmit={submit}>
          <div className="mb-3"><label>Name</label><input className="form-control" value={name} onChange={e=>setName(e.target.value)} required/></div>
          <div className="mb-3"><label>Email</label><input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div className="mb-3"><label>Password</label><input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
          <button className="btn btn-primary">Register</button>
        </form>
      </div>
    </div>
  )
}
