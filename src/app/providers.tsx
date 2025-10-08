"use client"
import {HeroUIProvider} from '@heroui/react'
import {ToastProvider} from "@heroui/toast";
import { Provider } from 'react-redux';
import { store } from '@/store';
import AuthInitializer from '@/components/auth/AuthInitializer';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <HeroUIProvider>
          <ToastProvider />
          {children}
        </HeroUIProvider>
      </AuthInitializer>
    </Provider>
  )
}