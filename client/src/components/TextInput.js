import React from "react";

function TextInput({ title, des, placeholder }) {
  return (
    <div className="space-y-3">
      <div className="">
        <p>{title}</p>
        {des.length !== 0 && <p className="text-sm text-sub-text">{des}</p>}
      </div>
      <div className="h-11 px-3 flex items-center rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
        <input
          type="text"
          placeholder={placeholder}
          className="h-full w-full bg-transparent"
        />
      </div>
    </div>
  );
}

export default TextInput;
