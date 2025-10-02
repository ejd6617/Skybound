

const SkyboundItemHolder = ({children, className, width, height})  => {
    return (
        <div className={`${className}`} 
        style= {{
          width: width, 
          height: height,
        }}
        >
          {children}
        </div>
      );
    };  

    export default SkyboundItemHolder;