import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const submit = async e => { e.preventDefault(); try{ await login(email,password); nav('/'); }catch(err){ alert('Login failed'); } };
  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3>Login</h3>
        <form onSubmit={submit}>
          <div className="mb-3"><label>Email</label><input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div className="mb-3"><label>Password</label><input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
          <button className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  )
}
