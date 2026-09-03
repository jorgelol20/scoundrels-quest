import { Fragment } from 'react'
import Navbar from './components/structure/Navbar.jsx';
import './App.css'
import ContentPage from './components/pages/ContentPage.jsx';
import Banner from './components/structure/Banner.jsx';
import Footer from './components/structure/Footer.jsx';

function App() {


  return (

    <Fragment>

        <Navbar className="navbar" />

        <Banner />
        <main className='MainPage'>
          <ContentPage />
        </main>
        <Footer />
      
    </Fragment>

  )
}

export default App
