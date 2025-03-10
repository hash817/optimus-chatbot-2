'use client'

import { createContext, useState, Dispatch, SetStateAction, ReactNode } from "react"

interface UiContextType {
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    errorMessage: string | null;
    setErrorMessage: Dispatch<SetStateAction<string | null>>;
    selectedMessageId: string | null;
    setSelectedMessageId: Dispatch<SetStateAction<string | null>>;
}

export const UiContext = createContext<UiContextType | undefined>(undefined);

export default function UiContextProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

    const ctxValue = {
        isLoading,
        setIsLoading,
        errorMessage,
        setErrorMessage,
        selectedMessageId,
        setSelectedMessageId
    }

    return <UiContext.Provider value={ctxValue}>
        {children}
    </UiContext.Provider>
}