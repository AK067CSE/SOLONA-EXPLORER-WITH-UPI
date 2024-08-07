import { useState, useEffect } from 'react';
import { getAvatarUrl } from '../functions/getAvatarUrl';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import BigNumber from 'bignumber.js';
import useLocalStorage from './useLocalStorage'; // Adjust the import path as needed

export const useCashApp = () => {
    const [avatar, setAvatar] = useState("");
    const [userAddress, setUserAddress] = useState("11111111111111111111111111111111");
    const [amount, setAmount] = useState(0);
    const [receiver, setReceiver] = useState('');
    const [transactionPurpose, setTransactionPurpose] = useState('');
    const [transactions, setTransactions] = useLocalStorage("transactions", []);
    const [newTransactionModalOpen, setNewTransactionModalOpen] = useState(false)

    const { connected, publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    useEffect(() => {
        if (connected && publicKey) {
            setAvatar(getAvatarUrl(publicKey.toString()));
            setUserAddress(publicKey.toString());
        }
    }, [connected, publicKey]);

    const makeTransaction = async (fromWallet, toWallet, amount, reference) => {
        const network = WalletAdapterNetwork.Devnet;
        const endpoint = clusterApiUrl(network);
        const connection = new Connection(endpoint);

        const { blockhash } = await connection.getLatestBlockhash('finalized');
        const transaction = new Transaction({
            recentBlockhash: blockhash,
            feePayer: fromWallet
        });

        const transferInstruction = SystemProgram.transfer({
            fromPubkey: fromWallet,
            lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
            toPubkey: toWallet,
        });

        transferInstruction.keys.push({
            pubkey: reference,
            isSigner: false,
            isWritable: false,
        });

        transaction.add(transferInstruction);
        return transaction;
    };

    const doTransaction = async () => {
        if (!connected || !publicKey) {
            console.error("Wallet not connected");
            return;
        }

        try {
            const fromWallet = publicKey;
            const toWallet = new PublicKey(receiver);
            const bnAmount = new BigNumber(amount);
            const reference = Keypair.generate().publicKey;
            const transaction = await makeTransaction(fromWallet, toWallet, bnAmount, reference);

            const txnHash = await sendTransaction(transaction, connection);
            console.log("Transaction Hash:", txnHash);
            //Create Transaction history object
            const newID= (transactions.length + 1).toString()
            const newTransaction = {
                id:newID,
                from:{
                    name:publicKey,
                    handle:publicKey,
                    avatar:avatar,
                    verified:true,
                },
                to:{
                    name:receiver,
                    handle:'_',
                    avatar:getAvatarUrl(receiver.toString()),
                    verified:false,
                },
                description:transactionPurpose,
                transactionDate:new Date(),
                status:'Completed',
                amount:amount,
                source:'_',
                identifier:'_'
            };
            setNewTransactionModalOpen(false)
            setTransactions([newTransaction,...transactions])

            // Update transactions state
            setTransactions(prevTransactions => [...prevTransactions, { hash: txnHash, amount: bnAmount.toString(), receiver, purpose: transactionPurpose }]);
        } catch (error) {
            console.error("Transaction failed:", error);
        };
    };

    return { 
        connected, 
        publicKey, 
        avatar, 
        userAddress, 
        doTransaction, 
        amount, 
        setAmount, 
        receiver, 
        setReceiver, 
        transactionPurpose, 
        setTransactionPurpose,
        transactions,
        setTransactions,
        setNewTransactionModalOpen,
        newTransactionModalOpen,
    };
};
