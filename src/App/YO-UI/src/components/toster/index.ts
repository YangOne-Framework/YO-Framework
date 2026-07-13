
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';


type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ShowToast {
    (type: ToastType, message: string, options?: any): void;
    (type: ToastType, title: string, message: string, options?: any): void;
}
interface IToaster {
    success: any;
    error: any;
    info: any;
    warning: any;
}

const showToast: ShowToast = (
    type: ToastType,
    titleOrMessage: string,
    message?: string,
    options: any = {}
) => {
    let content: React.ReactNode;

    //   if (message) {
    //     content = (
    //       <>
    //         <strong>{titleOrMessage}</strong>
    //         <br />
    //         {message}
    //       </>
    //     );
    //   } else {
    content = titleOrMessage;
    //}

    toast[type](content, {
        position: 'bottom-right',
        autoClose: 3000,
        ...options,
    });
};

const createToastFunctionSuccess = (arg1: string, arg2?: string, options?: any) => {
    if (typeof arg2 === 'string') {
        // Call signature 2: (type, title, message, options?)
        showToast("success", arg1, arg2, options);
    } else {
        // Call signature 1: (type, message, options?)
        showToast("success", arg1, "", arg2);
    }
}

const createToastFunctionError = (arg1: string, arg2?: string, options?: any) => {
    if (typeof arg2 === 'string') {
        // Call signature 2: (type, title, message, options?)
        showToast("error", arg1, arg2, options);
    } else {
        // Call signature 1: (type, message, options?)
        showToast("error", arg1, "", arg2);
    }
}

const createToastFunctionWarning = (arg1: string, arg2?: string, options?: any) => {
    if (typeof arg2 === 'string') {
        // Call signature 2: (type, title, message, options?)
        showToast("warning", arg1, arg2, options);
    } else {
        // Call signature 1: (type, message, options?)
        showToast("warning", arg1, "", arg2);
    }
}

const createToastFunctionInfo = (arg1: string, arg2?: string, options?: any) => {
    if (typeof arg2 === 'string') {
        // Call signature 2: (type, title, message, options?)
        showToast("info", arg1, arg2, options);
    } else {
        // Call signature 1: (type, message, options?)
        showToast("info", arg1, "", arg2);
    }
}


let toaster:any = {
    success: createToastFunctionSuccess,
    error: createToastFunctionError,
    info: createToastFunctionInfo,
    warning: createToastFunctionWarning,
}
export default toaster;