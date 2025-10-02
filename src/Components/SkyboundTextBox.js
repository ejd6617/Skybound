import {useState} from 'react'

const SkyboundTextBox = ({value, placeholder, type = "text", height, width, variant, style }) => {
        const [text, setText] = useState('')

        const handleChange = (e) => {
            setText(e.target.value);
        }

    return (
        <input type = {type}
        vaule={text}
        onChange={handleChange}
        placeholder={placeholder}
        className={`skyboundTextBox ${variant}`}
        style={{
        width:width,
        height:height,
        ...style
        }}
        ></input>
    )



}

export default SkyboundTextBox;