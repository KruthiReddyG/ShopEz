import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile(){
  const { user } = useAuth();
  if(!user) return null;
  return (
    <div>
      <h3>Profile</h3>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
    </div>
  )
}
