const Rating = (props) => {
    // props
    // rating (numeric) 0 to 5
    const rating = props.rating == -1 ? 4 : props.rating;
    if (rating > 0)
        return (
            <div>
            <span
                className={`fa fa-star ${rating > 0.5 ? "orange" : "grey"}`}/>
                <span
                    className={`fa fa-star ${rating > 1.5 ? "orange" : "grey"}`}/>
                <span
                    className={`fa fa-star ${rating > 2.5 ? "orange" : "grey"}`}/>
                <span
                    className={`fa fa-star ${rating > 3.5 ? "orange" : "grey"}`}/>
                <span
                    className={`fa fa-star ${rating > 4.5 ? "orange" : "grey"}`}/>
                <span> {rating}</span>
            </div>
        )
    else
        return '';
}