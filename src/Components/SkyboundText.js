import '../Styles/BasicComponets.css'

const SkyboundText = ({
  children,
  variant = "primary",
  fontSize,
  className = "",
  style = {},
}) => {
  return (
    <span
      className={`skyboundText ${variant}${className}`}
      style={{
        fontSize: fontSize
      }}
    >
      {children}
    </span>
  );
};

export default SkyboundText;