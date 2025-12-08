'use client'

import { CircleUserIcon } from "lucide-react";
import React from "react";
import Image from "next/image";

interface Props {
  picture: string | null;
  fullname?: string | null;
}

export const CurrentUserAvatar = ({ picture, fullname }: Props) => {
  const initials = fullname
    ?.split(' ')
    ?.map((word: string) => word[0])
    ?.join('')
    ?.toUpperCase();

  if(picture) {
    return (
      <Image
        src={picture}
        alt={initials ?? 'avatar'}
        width={30} height={30}
        className="w-full h-full rounded-full object-cover"
      />
    );
  }

  return <CircleUserIcon aria-hidden="true" className="size-6"/>;
}
