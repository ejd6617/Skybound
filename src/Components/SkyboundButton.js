import "../Styles/BasicComponets.css"

const SkyboundButton = ({children, variant = "primary",  onClick, className, style, type = 'button', height, width}) => {

    return (
        <button
            type={type}
            onClick={onClick}
             className={`skyboundButton ${variant}`} 
            style={ {
                height: height,
                width: width
            }}
           
        >
        {children}
        </button>

    );

};

export default SkyboundButton;
