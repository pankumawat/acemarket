const Rating = (props) => {
    // props
    // rating (numeric) 0 to 5
    if (props.rating > 0)
        return (
            <div>
            <span
                className={`fas fa-star ${props.rating > 0.5 ? "orange" : "grey"}`}/>
                <span
                    className={`fas fa-star ${props.rating > 1.5 ? "orange" : "grey"}`}/>
                <span
                    className={`fas fa-star ${props.rating > 2.5 ? "orange" : "grey"}`}/>
                <span
                    className={`fas fa-star ${props.rating > 3.5 ? "orange" : "grey"}`}/>
                <span
                    className={`fas fa-star ${props.rating > 4.5 ? "orange" : "grey"}`}/>
                <span> {props.rating}</span>
            </div>
        )
    else
        return '';
}