
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SenderData {
  type: 'individual' | 'company';
  name: string;
  phone: string;
  email: string;
}

interface AddressData {
  address: string;
  city: string;
  country: string;
}

interface ParcelData {
  type: 'document' | 'standard' | 'fragile' | 'express';
  weight_kg: number;
  declared_value: number;
  options: string[];
}

interface QuoteData {
  quote_id: string;
  price: string;
  currency: string;
  estimated_delivery: string;
  breakdown?: {
    base: number;
    weight: number;
    type_multiplier: number;
    options: string[];
  };
}

interface ShipmentFormData {
  sender: SenderData;
  pickup: AddressData;
  delivery: AddressData;
  parcel: ParcelData;
}

interface ShipmentContextType {
  formData: ShipmentFormData | null;
  quoteData: QuoteData | null;
  setFormData: (data: ShipmentFormData) => void;
  setQuoteData: (data: QuoteData) => void;
  clearShipmentData: () => void;
  getFullShipmentData: () => { formData: ShipmentFormData | null; quoteData: QuoteData | null };
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export function ShipmentProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<ShipmentFormData | null>(null);
  const [quoteData, setQuoteDataState] = useState<QuoteData | null>(null);

  const setFormData = (data: ShipmentFormData) => {
    console.log('[SHIPMENT_CONTEXT] Setting form data:', data);
    setFormDataState(data);
  };

  const setQuoteData = (data: QuoteData) => {
    console.log('[SHIPMENT_CONTEXT] Setting quote data:', data);
    setQuoteDataState(data);
  };

  const clearShipmentData = () => {
    console.log('[SHIPMENT_CONTEXT] Clearing shipment data');
    setFormDataState(null);
    setQuoteDataState(null);
  };

  const getFullShipmentData = () => {
    return { formData, quoteData };
  };

  const value: ShipmentContextType = {
    formData,
    quoteData,
    setFormData,
    setQuoteData,
    clearShipmentData,
    getFullShipmentData,
  };

  return (
    <ShipmentContext.Provider value={value}>
      {children}
    </ShipmentContext.Provider>
  );
}

export function useShipment() {
  const context = useContext(ShipmentContext);
  if (context === undefined) {
    throw new Error('useShipment must be used within a ShipmentProvider');
  }
  return context;
}
