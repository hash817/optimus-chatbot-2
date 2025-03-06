'use client'

import { createContext, useState, Dispatch, SetStateAction, ReactNode } from "react"

interface UiContextType {
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    errorMessage: string | null;
    setErrorMessage: Dispatch<SetStateAction<string>>;
}

export const UiContext = createContext<UiContextType | undefined>(undefined);

export default function UiContextProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const ctxValue = {
        isLoading,
        setIsLoading,
        errorMessage,
        setErrorMessage
    }

    return <UiContext.Provider value={ctxValue}>
        {children}
    </UiContext.Provider>
}