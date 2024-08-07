import { useState } from 'react';
import Action from '../components/header/Action';
import NavMenu from '../components/header/NavMenu';
import Profile from '../components/header/Profile';
import SearchBar from '../components/home/SearchBar';
import NewTransactionModal from '../components/transaction/NewTransactionModal';
import TransactionsList from '../components/transaction/TransactionsList';
import TransactionQRModal from '../components/transaction/TransactionQRModal';
import { useCashApp } from '../hooks/cashapp';

const Home = () => {
    const [transactionQRModalOpen, setTransactionQRModalOpen] = useState(false);
const[qrCode,setQrCode] = useState(false)
    const {
        connected,
        publicKey,
        avatar,
        userAddress,
        transactions,
        newTransactionModalOpen,
        setNewTransactionModalOpen
    } = useCashApp();

    console.log(transactions, "HERE IT IS");

    return (
        <div className="flex min-h-screen">
            <header className="flex w-[250px] flex-col bg-[#0bb534] p-12">
                <Profile setModalOpen={setTransactionQRModalOpen} avatar={avatar} userAddress={userAddress} />
                <TransactionQRModal modalOpen={transactionQRModalOpen} setModalOpen={setTransactionQRModalOpen} userAddress={userAddress} myKey={publicKey} setQrCode={setQrCode} />
                <NavMenu connected={connected} myKey={publicKey} />
                <Action setModalOpen={setNewTransactionModalOpen} />
                <NewTransactionModal modalOpen={newTransactionModalOpen} setModalOpen={setNewTransactionModalOpen} />
            </header>

            <main className="flex flex-1 flex-col">
                <SearchBar />
                <TransactionsList connected={connected} transactions={transactions} />
            </main>
        </div>
    );
};

export default Home;
