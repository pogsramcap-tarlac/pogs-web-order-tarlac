import React from 'react'
import ty from '../../assets/images/ty.png'
import "./thankyou.css"

function thankyou() {
    return (
        <>
            <div>
                <img className="thank-you" src={ty} alt="thankyou" />
            </div>
            <div className="btn-parent-bth">
                <a href="https://pogs.ph/" className="btn btn-bth">
                    Back To Home
                </a>
            </div>
        </>
    )
}

export default thankyou