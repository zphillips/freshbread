import React from 'react'
import './Rest.css'

const Rest = (props) => {
    return(
        <div className="rest">
            <h1>{props.name}</h1>
            <b className="covid-rating">Confirmed Covid Cases: {props.confirmed}</b>
            <p>Rating: {props.rating}</p>
            {/* <p>Price level: {props.price_level}</p>   */}
        </div>
    )
}

export default Rest;