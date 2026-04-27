import React from 'react';
import { formatDateTime } from '../utils/timeUtils';

export default function TransactionDetailsModal({show, onClose,logData,type}){
    if(!show || !logData) return null;

    //Extract variables
    const transactionLog = logData["transaction-log"] || [];
    const jobName =  logData["job-name"] || "-";
    const scheduleName = logData["schedule-name"] || "-";


    //Identifier to show in Header
    const identifierText = type ==="BACKUP"
    ?`Schedule Name : ${scheduleName} | Backup Job Name : ${jobName}`
    :`Restore Job Id : ${logData["job-id"] || "-"}`;
    
    const endTime =`End Time : ${formatDateTime(logData["end-time"]) || "-"}`;
    
    return(
        <div
            className='modal show d-block'
            style={{backgroundColor:"rgba(0,0,0,0.5)", zIndex:9999}}
            onClick={onClose}
        >
            <div
                className='modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable'
                onClick={(e)=>e.stopPropagation()}
            >
                <div className='modal-content'>
                    <div className='modal-header' style={{backgroundColor:"#E6F0FF", borderBottom: "2px solid #0067FF"}}>
                        <h5 className='modal-title' style={{color:"#0067FF"}}>
                            <i className='bi bi-list-check me-2'></i>
                                Transaction Details ({type})
                        </h5>
                        <button
                            type='button'
                            className='btn-close'
                            style={{filter:'none'}}
                            onClick={onClose}
                        ></button>
                    </div>

                    <div className='modal-body pb-4'>
                        <div className='mb-4 p-3 bg-light rounded border'>
                            {/* <small className='text-muted d-block fw-bold mb-1'>REFERENCE</small> */}
                            <div className='text-dark'>
                                {identifierText}
                            </div>
                            <div>
                                {endTime}
                            </div>
                        </div>

                        <h6 className='fw-bold mb-3'>Workflow Steps ({transactionLog.length})</h6>

                        <div className='d-flex flex-column ps-2' style={{position:"relative"}}>
                            {transactionLog.length===0 ?(
                               <span className='text-muted'>No Transaction steps recorded.</span>
                            ):(
                                transactionLog.map((step, idx)=>{
                                    const isLast = idx === transactionLog.length-1;
                                    const stepText = typeof step === 'object' && step !== null
                                        ? step.message || JSON.stringify(step)
                                        : String(step);
                                    return(
                                        <div key={idx} className='d-flex align-items-center mb-3' style={{position:"relative"}}>
                                            {/* Vertical Lines Connecting nodes */}
                                            {!isLast && (
                                                <div 
                                                    style={{
                                                        position:"absolute",
                                                        left:"6px",
                                                        top:"20px",
                                                        bottom:"-16px",
                                                        width:"2px",
                                                        backgroundColor:"#dee2e6"
                                                    }}
                                                ></div>
                                            )}

                                            {/* Icon */}
                                            <div style={{zIndex:1}} className='me-3'>
                                                {isLast ?(
                                                    <i className="bi bi-x-circle-fill text-danger fs-5 bg-white" style={{ display: "inline-block", borderRadius: "50%" }}></i>
                                                ):(
                                                    <i className="bi bi-check-circle-fill text-primary fs-5 bg-white" style={{ display: "inline-block", borderRadius: "50%" }}></i>
                                                )}
                                            </div>

                                            {/* Step Text */}
                                            <div>
                                                <span className={isLast? 'text-danger':'text-dark'}>
                                                    {stepText}
                                                </span>
                                                {typeof step === 'object' && step?.timestamp && (
                                                    <div className='text-muted small'>{new Date(step.timestamp).toLocaleString()}</div>
                                                )}
                                            </div>
                                        </div>  
                                    )
                                })
                            )}
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <button className='btn btn-secondary btn-sm' onClick={onClose}>
                            Close
                        </button>

                    </div>
                </div>

            </div>

        </div>
    )

}