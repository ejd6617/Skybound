const SkyboundButton = ({children, onClick, className, style, type = 'button'}) => {

    return (
        <button
            type={type}
            onClick={onClick}
            className={className}
            style={style}
        >
        {children}
        </button>

    );

};

export default SkyboundButton;
