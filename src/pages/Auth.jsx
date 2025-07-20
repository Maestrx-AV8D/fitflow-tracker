import { Routes, Route, Navigate } from 'react-router-dom'
import SignIn from '../components/SignIn.jsx'
import SignUp from '../components/SignUp.jsx'

export default function Auth() {
  return (
    <Routes>
      <Route path="signin" element={<SignIn />} />
      <Route path="signup" element={<SignUp />} />
      <Route path="*" element={<Navigate to="signin" replace />} />
    </Routes>
  )
}