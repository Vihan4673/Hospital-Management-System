import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className='h-screen'>
      <div className='fixed top-0 left-0 right-0 z-50'>
        <Navbar/>
      </div>
      <main className='pt-16 h-full lg:overflow-hidden'>
        <Outlet/>
      </main>
    </div>
  )
}

export default Layout
