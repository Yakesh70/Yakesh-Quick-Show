import React, { useEffect, useState } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Loading from '../../components/Loading'

const Layout = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const {isAdmin, fetchIsAdmin, user} = useAppContext()

  useEffect(()=>{
    const checkAdmin = async () => {
      try {
        if (user) {
          console.log('User data:', user);
          console.log('User public metadata:', user.publicMetadata);
          await fetchIsAdmin()
        }
      } catch (err) {
        setError('Failed to verify admin access')
      } finally {
        setLoading(false)
      }
    }
    
    checkAdmin()
  },[user])

  if (loading) return <Loading/>
  
  // Temporarily bypass for testing - check console for user data
  // if (error || !isAdmin) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <p className="text-red-500 mb-4">{error || 'Access denied. Admin privileges required.'}</p>
  //         <button 
  //           onClick={() => window.location.href = '/'} 
  //           className="px-4 py-2 bg-primary text-white rounded"
  //         >
  //           Go Home
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <>
      <AdminNavbar />
      <div className='flex'>
        <AdminSidebar/>
        <div className='flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto'>
            <Outlet />
        </div>
      </div>
    </>
  )
}

export default Layout
