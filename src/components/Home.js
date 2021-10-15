import React from 'react'
import { Link } from 'react-router-dom'

/**
* @author
* @function Home
**/

export const Home = (props) => {

  const startKYC = () => {

}

const startPI = () => {

}
  return(
    <div>
        <Link to='/kyc'><button onClick={startKYC}>Start KYC</button></Link>
        <Link to='pi'><button onClick={startPI}>Start Personal Interview</button></Link>
    </div>
   )

 }