'use client';

import React from "react";
import PricingCard from "@/components/PricingCards/PricingCard";
import { useRouter } from "next/navigation";

export default function PricingCards() {
  const router = useRouter();
  const plans = [
    {
      id: "BASIC",
      name: "Básico",
      price: "$0",
      period: "/mes",
      features: ["1 usuario", "5 GB de almacenamiento", "Soporte por correo"],
      color: "border-gray-300 text-gray-700 hover:border-gray-400",
      disabled: true
    },
    {
      id: "575577e4-abab-4286-bfb9-9e3c809bcb67",
      name: "Pro",
      price: "$10.00",
      period: "/mes",
      features: [
        "Hasta 5 usuarios",
        "100 GB de almacenamiento",
        "Soporte prioritario",
        "Integraciones avanzadas",
      ],
      color: "border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100 shadow-md",
      highlight: true,
    },
    {
      id: "62f7de06-6bfc-4438-aa3d-e323e51ea0c4",
      name: "Empresarial",
      price: "$20.00",
      period: "/mes",
      features: [
        "Usuarios ilimitados",
        "1 TB de almacenamiento",
        "Soporte dedicado 24/7",
        "API personalizada",
      ],
      color: "border-gray-400 text-gray-800 hover:border-gray-500",
    },
  ];

  const onClick = async (event: React.MouseEvent<HTMLButtonElement>, planId: string) => {
    /**
     * TODO: 1. verificar si está logueado. 2. redirigir al carrito. 3. pagar.
     */

    router.push('/plans/checkout/' + planId);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
      {plans.map((plan) => (
        <PricingCard key={`plan-${plan.name}`} plan={plan} onClick={onClick} />
      ))}
    </div>
  );
}
