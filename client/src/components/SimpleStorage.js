import { React, useState } from "react";

export default function SimpleStorage({ account, contract }) {
  const [newValue, setNewValue] = useState();
  const [storageValue, setStorageValue] = useState(0);

  function handleChange(e) {
    setNewValue(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await contract.methods.setX(newValue).send({ from: account });
    const response = await contract.methods.getX().call();
    setStorageValue(response);
  }

  return (
    <div className="fixed h-full w-full flex flex-col justify-center items-center space-y-5 bg-background text-white">
      <span className="text-2xl">The stored value is: {storageValue}</span>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
        <input
          type="text"
          value={newValue}
          onChange={handleChange}
          className="h-11 p-3 rounded-lg text-black"
        />
        <button type="submit" className="h-11 px-8 rounded-lg bg-primary">
          Submit
        </button>
      </form>
    </div>
  );
}
