import React, { useState, useEffect } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

// import "./App.css";
import Navbar from "./components/Navbar";

function App() {
  const [newValue, setNewValue] = useState(undefined);
  const [storageValue, setStorageValue] = useState(undefined);
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();

        const accounts = await web3.eth.getAccounts();

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = SimpleStorageContract.networks[networkId];
        const contract = new web3.eth.Contract(
          SimpleStorageContract.abi,
          deployedNetwork.address
        );

        console.log({ account: accounts[0], networkId: networkId });
        console.log(deployedNetwork);
        setWeb3(web3);
        setAccounts(`${accounts[0].slice(0, 5)} ... ${accounts[0].slice(-6)}`);
        setContract(contract);
      } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    };
    init();
  });

  useEffect(() => {
    const load = async () => {
      await contract.methods.setX(5).send({ from: accounts[0] });
      const response = await contract.methods.getX().call();
      setStorageValue(response);
    };
    // if (
    //   typeof web3 !== "undefined" &&
    //   typeof accounts !== "undefined" &&
    //   typeof contract !== "undefined"
    // ) {
    //   load();
    // }
  }, [web3, accounts, contract]);

  function handleChange(e) {
    setNewValue(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await contract.methods.setX(newValue).send({ from: accounts[0] });
    const response = await contract.methods.getX().call();
    setStorageValue(response);
  }

  async function connectWallet() {
    if (accounts.length === 0) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccounts(accounts);
    }
  }

  window.ethereum.on('accountsChanged', function (accounts) {
    setAccounts("");
    window.location.reload();
  })
  
  window.ethereum.on('networkChanged', function (networkId) {
    // Time to reload your interface with the new networkId
  })

  return (
    <div className="w-full h-screen bg-background">
      <Navbar connectWallet={connectWallet} accounts={accounts} />
      <div className="text-red-500">
        <h1>Welcome do this dapp!</h1>
        <div>The stored value is: {storageValue}</div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newValue}
            onChange={handleChange.bind(this)}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
}

export default App;
