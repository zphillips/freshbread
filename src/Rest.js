import React from 'react'
import './Rest.css'

const Rest = (props) => {
    return(
        <div className="rest">
            <h1 className="rest-name">{props.name}</h1>
            <b className="covid-rating">Confirmed Covid Cases By County: {props.confirmed}</b>
            <p className="rating">Rating: {props.rating}</p>
            {/* <p>Price level: {props.price_level}</p>   */}
        </div>
    )
}

export default Rest;