import { Fragment, useState, useRef } from 'react'
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/structure/Navbar.jsx';
import './App.css'
import ContentPage from './components/pages/ContentPage.jsx';
import Banner from './components/structure/Banner.jsx';
import Footer from './components/structure/Footer.jsx';
import GAListener from './components/structure/GAListener.jsx';

function App() {


  return (

    <Fragment>
      <BrowserRouter>
        <GAListener />
        <h1>Prueba Workflow</h1>
        <Navbar className="navbar" />

        <Banner />
        <main className='MainPage'>
          <ContentPage />
        </main>
        <Footer />
      </BrowserRouter>
    </Fragment>

  )
}

export default App
