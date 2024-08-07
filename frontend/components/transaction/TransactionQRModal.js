import Modal from '../Modal'
import { createQR, encodeURL, findReference, validateTransfer, FindReferenceError, ValidateTransferError } from "@solana/pay"
import { PublicKey, Keypair } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useRef, useState } from 'react';
import { truncate } from "../../utils/string"
import { useCashApp } from '../../hooks/cashapp';
import { getAvatarUrl } from '../../functions/getAvatarUrl';




const TransactionQRModal = ({ modalOpen, setModalOpen, userAddress,setQrCode }) => {
const {transactions,setTransactions}= useCashApp()
    //we need to generate the QR Code based on publickey then
    // Set the state to true to rerender the component with generated QR
  const qrRef = useRef()
  const{connection} = useConnection()
  
    const loadQr = () => {
setQrCode(true)
    }
    useEffect(()=>{
        //Generate  a QR code
        const recipient =new PublicKey(userAddress)
        const amount = new BigNumber("1")
        const reference = Keypair.generate().publicKey
        const label = "Evil Cookies Inc"
        const message = "Thanks for your Sol!"
        const  urlParams={
            recipient,
            amount,
            reference,
            label,
            message,

        }
        const url = encodeURL(urlParams)
        const qr= createQR(url,488,'transparent')
        if(qrRef.current){
            qrRef.current.innerHTML = ''
            qr.append(qrRef.current)
        }
        //Wait for the user to send the transaction

        const interval = setInterval(async()=>{
            console.log("waiting for transaction confirmation")
            try{
const signatureInfo = await findReference(connection,reference,{finality:'confirmed'})
console.log("validating")
await validateTransfer(connection,signatureInfo.signature,{
    recipient,
    amount,
    reference,

},
{
    commitment:'confirmed'
})
//AT this point the transaction is confirmed
//Lets add the transaction to our LocalStorage
const newID= (transactions.length + 1).toString()
const newTransaction = {
    id:newID,
    from:{
        name:recipient,
        handle:recipient,
        avatar:getAvatarUrl(recipient.toString()),
        verified:true,
    },
    to:{
        name:reference,
        handle:'_',
        avatar:getAvatarUrl(reference.toString()),
        verified:false,
    },
    description:'User sent you SOL through Phantom App!',
    transactionDate:new Date(),
    status:'Completed',
    amount:amount,
    source:'_',
    identifier:'_'
};

setTransactions([newTransaction,...transactions]);
setModalOpen(false);
clearInterval(interval)

            }catch(e){
if(e instanceof FindReferenceError){
    return 
}
if(e instanceof ValidateTransferError){
    console.error('Transaction is invalid',e)
    return;
}
console.error('Unknown error','e')
            }
        },500)
        return () => clearInterval(interval)
    })

    return (
        <Modal modalOpen={modalOpen} setModalOpen={setModalOpen}>
            <div >
                <div className="flex flex-col items-center justify-center space-y-1">
                <div ref={qrRef}/>
                <div />
                    
                </div>

                <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="text-lg font-medium text-gray-800">{truncate(userAddress)}</p>

                    <p className="text-sm font-light text-gray-600">Scan to pay ${truncate(userAddress)}</p>

                    <button onClick={() => loadQr()} className="w-full rounded-lg bg-[#16d542] py-3 hover:bg-opacity-70">
                        <span className="font-medium text-white">Load QR code</span>
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default TransactionQRModal
