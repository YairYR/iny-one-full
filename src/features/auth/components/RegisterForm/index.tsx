'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from "next/navigation";

import { Mail, SquareAsterisk, SquareUserRound } from "lucide-react";
import { GoogleButton } from "@/features/auth/components/OAuth/GoogleButton";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
      })
    }).then(res => res.json());

    if (response.error) {
      console.error(response.error)
      return;
    }
    router.push('/')
  }

  const onChangeName = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = ev.currentTarget.value;
    setName(value);
  }

  const onChangeEmail = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = ev.currentTarget.value;
    setEmail(value);
  }

  const onChangePassword = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = ev.currentTarget.value;
    setPassword(value);
  }

  const onClickGoogle = async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        provider: 'google'
      })
    }).then(res => res.json());

    if (response.error) {
      console.error(response.error)
      return;
    }
    router.push(response.data.url);
  }

  return (
    <div
      className="flex flex-col w-full md:w-1/2 xl:w-2/5 2xl:w-2/5 3xl:w-1/3 mx-auto p-8 md:p-10 2xl:p-12 3xl:p-14 bg-[#ffffff] rounded-2xl shadow-xl">
      <div className="flex flex-row gap-3 pb-4">
        <div>
          <Image src="/apple-touch-icon.png" alt="Logo" width="50" height="50" />
        </div>
        <h1 className="text-3xl font-bold text-[#4B5563] my-auto">Iny.One</h1>

      </div>
      {/*<div className="text-sm font-light text-[#6B7280] pb-8 ">Sign up for an account on Your Company.</div>*/}

      <form className="flex flex-col" onSubmit={onSubmit}>
        <div className="pb-2">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-[#111827]">Name</label>
          <div className="relative text-gray-400">
            <span className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
              <SquareUserRound />
            </span>
            <input type="text" name="name" id="name" value={name} onChange={onChangeName}
                   className="pl-12 mb-2 bg-gray-50 text-gray-600 border focus:border-transparent border-gray-300 sm:text-sm rounded-lg ring-3 ring-transparent focus:ring-1 focus:outline-hidden focus:ring-gray-400 block w-full p-2.5 rounded-l-lg py-3 px-4"
                   placeholder="Your Name" autoComplete="off"/>
          </div>
        </div>
        <div className="pb-2">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-[#111827]">Email</label>
          <div className="relative text-gray-400">
            <span className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
              <Mail />
            </span>
            <input type="email" name="email" id="email" value={email} onChange={onChangeEmail}
                   className="pl-12 mb-2 bg-gray-50 text-gray-600 border focus:border-transparent border-gray-300 sm:text-sm rounded-lg ring-3 ring-transparent focus:ring-1 focus:outline-hidden focus:ring-gray-400 block w-full p-2.5 rounded-l-lg py-3 px-4"
                   placeholder="name@company.com" autoComplete="off"/>
          </div>
        </div>
        <div className="pb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-[#111827]">Password</label>
          <div className="relative text-gray-400">
            <span className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
              <SquareAsterisk />
            </span>
            <input type="password" name="password" id="password" placeholder="••••••••••" value={password} onChange={onChangePassword}
                   className="pl-12 mb-2 bg-gray-50 text-gray-600 border focus:border-transparent border-gray-300 sm:text-sm rounded-lg ring-3 ring-transparent focus:ring-1 focus:outline-hidden focus:ring-gray-400 block w-full p-2.5 rounded-l-lg py-3 px-4"
                   autoComplete="new-password"/>
          </div>
        </div>
        <button type="submit"
                className="w-full text-[#FFFFFF] bg-[#4F46E5] focus:ring-4 focus:outline-hidden focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-6">Sign
          Up
        </button>
        <div className="text-sm font-light text-[#6B7280] ">
          Already have an account? <Link href="/auth/login" className="font-medium text-[#4F46E5] hover:underline">Login</Link>
        </div>
      </form>
      <div className="relative flex py-8 items-center">
        <div className="grow border-t border-[1px] border-gray-200"></div>
        <span className="shrink mx-4 font-medium text-gray-500">OR</span>
        <div className="grow border-t border-[1px] border-gray-200"></div>
      </div>
      <form>
        <div className="flex flex-row gap-2 justify-center">
          <GoogleButton onClick={onClickGoogle}>
            Sign in with Google
          </GoogleButton>
        </div>
      </form>
    </div>
  );
}