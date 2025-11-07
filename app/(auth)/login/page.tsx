"use client";

import { useState } from "react";
import { auth } from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/todos");
    } catch (e: any) {
      setErr(e.message ?? "認証に失敗しました");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3 border rounded-xl p-6">
        <h1 className="text-2xl font-bold text-center">ToDo ログイン</h1>

        <div className="flex gap-2 text-sm justify-center mb-2">
          <button type="button"
            onClick={() => setMode("signin")}
            className={`px-3 py-1 rounded ${mode==="signin" ? "bg-black text-white" : "bg-gray-200"}`}>
            サインイン
          </button>
          <button type="button"
            onClick={() => setMode("signup")}
            className={`px-3 py-1 rounded ${mode==="signup" ? "bg-black text-white" : "bg-gray-200"}`}>
            新規登録
          </button>
        </div>

        <input
          type="email"
          placeholder="Email"
          className="border w-full p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password（6文字以上）"
          className="border w-full p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button className="w-full bg-blue-600 text-white p-2 rounded hover:opacity-90">
          {mode === "signin" ? "ログイン" : "アカウント作成"}
        </button>
      </form>
    </div>
  );
}
