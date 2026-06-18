import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar(){
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const handleLogout = () => { logout(); nav('/'); };
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">ShopEZ</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link" to="/products">Products</Link></li>
          </ul>
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/cart">Cart</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/orders">Orders</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/profile">{user.name}</Link></li>
                {user.role==='admin' && <li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>}
                <li className="nav-item"><button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
