import React from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import api from "../api";

export default function BotonPaypal({ cita, onSuccess }) {
  return (
    <div className="w-full mt-4">
      <PayPalButtons
        style={{ 
          layout: "vertical", 
          color: "blue", 
          shape: "pill", 
          label: "pay",
          height: 40 
        }}
        fundingSource={undefined} 
        
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: `Servicio de Barbería: ${cita.servicio_nombre || 'Corte'}`,
                amount: {
                  currency_code: "MXN",
                  value: cita.precio.toString(), 
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          const details = await actions.order.capture();
          try {
            await api.patch(`/citas/estado/${cita.id_cita}`, { estado: 'Completada' });
            onSuccess(details.payer.name.given_name);
          } catch (error) {
            console.error("Error al confirmar el pago:", error);
          }
        }}
      />
    </div>
  );
}