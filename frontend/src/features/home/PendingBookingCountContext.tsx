import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

type PendingBookingCountContextValue = {
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
};

const PendingBookingCountContext =
  createContext<PendingBookingCountContextValue | null>(null);

export function PendingBookingCountProvider({ children }: PropsWithChildren) {
  const [count, setCount] = useState(0);

  return (
    <PendingBookingCountContext.Provider value={{ count, setCount }}>
      {children}
    </PendingBookingCountContext.Provider>
  );
}

export function usePendingBookingCount() {
  const context = useContext(PendingBookingCountContext);
  if (!context) {
    throw new Error('usePendingBookingCount must be used within its provider');
  }
  return context;
}
