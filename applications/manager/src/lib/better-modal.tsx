import { useEventCallback } from "@/hooks/use-event-callback";
import { FunctionComponent, ReactNode, createContext, useContext, useState } from "react";

export type BetterModalProps<R = void> = {
    isOpen: boolean;
    resolve: (value: R) => void;
};

export interface OpenBetterModal {
    <P extends BetterModalProps<any>, R extends (P extends BetterModalProps<infer R> ? R : never)>(modal: FunctionComponent<P>, data: Omit<P, keyof BetterModalProps<R>>): Promise<R>;
}

const ModalContext = createContext<OpenBetterModal>(null as any);

type ModalData<T extends object, R = void> = {
    component: FunctionComponent<T & BetterModalProps<R>>;
    params: T;
    key: number;
} & BetterModalProps<R>;

let keyCounter = 0;

export const BetterModalProvider = ({ children }: { children: ReactNode }) => {
    const [modals, setModals] = useState<ModalData<any, any>[]>([]);
    const destroyModal = useEventCallback((key: number) => {
        setModals(modals => modals.filter(modal => modal.key !== key));
    });
    const hideModal = useEventCallback((key: number) => {
        setModals(modals => modals.map(modal => modal.key === key ? { ...modal, isOpen: false } : modal));
        setTimeout(() => destroyModal(key), 500); // wait for animation
    });

    const openModal = useEventCallback(((modal, data) => {
        return new Promise(resolve => {
            const newData: ModalData<any, any> = {
                component: modal,
                params: data,
                isOpen: true,
                resolve: (value) => {
                    hideModal(newData.key);
                    resolve(value);
                },
                key: keyCounter++,
            };
            setModals([...modals, newData]);
        });
    }) as OpenBetterModal);

    return <ModalContext.Provider value={openModal}> 
        {children}
        {modals.map(data => <data.component {...data.params} isOpen={data.isOpen} resolve={data.resolve} key={data.key} />)}
    </ModalContext.Provider>;
};

export const useBetterModal = () => useContext(ModalContext) as OpenBetterModal;