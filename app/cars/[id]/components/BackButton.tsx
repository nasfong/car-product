"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BackButton({ carName }: { carName: string }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
    >
      <ArrowLeft className="h-5 w-5" />
      <span className="hidden sm:inline">ត្រលប់ក្រោយ</span>
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
        {carName}
      </h1>
    </Link>
  );
}
