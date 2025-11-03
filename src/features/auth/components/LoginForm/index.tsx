import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from "next/router";
import { Mail, SquareAsterisk } from 'lucide-react';

import isEmail from "validator/lib/isEmail";
import { GoogleButton } from "@/features/auth/components/OAuth/GoogleButton";
import clsx from "clsx";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onClickSignUp = async () => {
    await router.push("/auth/register");
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);

    if(!email || !password || !isEmail(email)) {
      return;
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      })
    }).then(res => res.json());

    if (response.error) {
      setLoading(false);
      console.error(response.error)
      return;
    }

    await router.push('/dashboard');
    setLoading(false);
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
    setLoading(true);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        provider: 'google'
      })
    }).then(res => res.json());

    if (response.error) {
      setLoading(false);
      console.error(response.error);
      return;
    }

    await router.push(response.data.url);
  }

  return (
    <div className={clsx("bg-white rounded-xl shadow-lg p-8 mb-6", loading && 'cursor-progress')}>
      <div className="flex flex-row gap-3 pb-4">
        <div>
          <Image src="/apple-touch-icon.png" alt="Logo" width="50" height="50"/>
        </div>
        <h1 className="text-3xl font-bold text-[#4B5563] my-auto">Iny.One</h1>
      </div>
      {/*<div className="text-sm font-light text-[#6B7280] pb-8 ">Login to your account on Your Company.</div>*/}
      <form className="flex flex-col" onSubmit={onSubmit}>
        <div className="pb-2">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-[#111827]">Email</label>
          <div className="relative text-gray-400">
            <span className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
              <Mail/>
            </span>
            <input type="email" name="email" id="email" value={email} onChange={onChangeEmail} disabled={loading}
                   className="pl-12 mb-2 bg-gray-50 text-gray-600 border focus:border-transparent border-gray-300 sm:text-sm rounded-lg ring-3 ring-transparent focus:ring-1 focus:outline-hidden focus:ring-gray-400 block w-full p-2.5 rounded-l-lg py-3 px-4"
                   placeholder="name@company.com" autoComplete="off"/>
          </div>
        </div>
        <div className="pb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-[#111827]">Password</label>
          <div className="relative text-gray-400">
            <span className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
              <SquareAsterisk/>
            </span>
            <input type="password" name="password" id="password" placeholder="••••••••••" value={password}
                   onChange={onChangePassword} disabled={loading}
                   className="pl-12 mb-2 bg-gray-50 text-gray-600 border focus:border-transparent border-gray-300 sm:text-sm rounded-lg ring-3 ring-transparent focus:ring-1 focus:outline-hidden focus:ring-gray-400 block w-full p-2.5 rounded-l-lg py-3 px-4"
                   autoComplete="new-password"/>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={clsx(
            "w-full text-[#FFFFFF] bg-[#4F46E5] focus:ring-4 focus:outline-hidden focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-6",
            loading ? 'cursor-progress' : 'cursor-pointer',
            loading && 'bg-gray-400'
          )}>Login
        </button>
        <div className="text-sm font-light text-[#6B7280] ">
          Don&#39;t have an account yet?{" "}<a href="#"
            onClick={onClickSignUp}
            className="font-medium text-[#4F46E5] hover:underline">Sign Up</a>
        </div>
      </form>
      <div className="relative flex py-8 items-center">
        <div className="grow border-t border-[1px] border-gray-200"></div>
        <span className="shrink mx-4 font-medium text-gray-500">OR</span>
        <div className="grow border-t border-[1px] border-gray-200"></div>
      </div>
      <form>
        <div className="flex flex-row gap-2 justify-center">
          <GoogleButton onClick={onClickGoogle} disabled={loading}>
            Sign in with Google
          </GoogleButton>
        </div>
      </form>

    </div>
  )
}
