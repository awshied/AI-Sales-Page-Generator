"use client";

import React, { useState, ChangeEvent } from "react";
import Image, { StaticImageData } from "next/image";

interface FloatingInputProps<T> {
  label: string;
  name: string;
  type?: "text" | "password" | "email" | "number" | "textarea";
  value: T;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  icon?: string | StaticImageData;
}

function FloatingInput<T extends string | number | boolean>({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon,
}: FloatingInputProps<T>) {
  const [focused, setFocused] = useState(false);

  const iconSrc = icon && (typeof icon === "string" ? icon : icon.src);

  const isActive = focused || (value !== undefined && String(value).length > 0);

  return (
    <div className="relative w-full">
      <label
        htmlFor={name}
        className={`absolute left-0 transition-all duration-300 font-semibold ${
          isActive
            ? "-top-2 text-warning text-sm"
            : "top-1 text-gray-400 text-base"
        }`}
      >
        {label}
      </label>

      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-[#d6d6d6] border-b-2 border-gray-600 pb-2 pt-5 outline-none focus:border-warning pr-10 resize-none"
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value as string | number}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-[#d6d6d6] border-b-2 border-gray-600 pb-2 pt-5 outline-none focus:border-warning pr-10"
        />
      )}

      {iconSrc && (
        <Image
          src={iconSrc}
          alt="icon"
          width={20}
          height={20}
          className={`absolute right-1 bottom-3 transition-all duration-300 ${isActive ? "icon-active-yellow" : ""}`}
        />
      )}
    </div>
  );
}

export default FloatingInput;
