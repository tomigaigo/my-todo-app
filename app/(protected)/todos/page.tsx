"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import {
  addDoc, collection, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp, where,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

type Todo = { id: string; title: string; done?: boolean };

export default function TodosPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const router = useRouter();

  // 認証ガード & ユーザー確定
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login");
      } else {
        setUserId(u.uid);
      }
    });
    return () => unsub();
  }, [router]);

  // ToDo購読
  useEffect(() => {
    if (!userId) return;
    // const q = query(
    //   collection(db, "todos"),
    //   where("uid", "==", userId),
    //   orderBy("createdAt", "desc")
    // );
    const q = query(
        collection(db, "todos"),
        where("uid", "==", userId)
    );
    const unsub = onSnapshot(q, (snap) => {
      setTodos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, [userId]);

  async function addTodo() {
    if (!text || !userId) return;
    await addDoc(collection(db, "todos"), {
      title: text,
      uid: userId,
      createdAt: serverTimestamp(),
    });
    setText("");
  }

  async function remove(id: string) {
    await deleteDoc(doc(db, "todos", id));
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">My ToDo</h1>
        <button
          onClick={() => { signOut(auth); router.push("/login"); }}
          className="text-sm text-red-600"
        >
          ログアウト
        </button>
      </div>

      <div className="flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          placeholder="やることを入力"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={addTodo} className="px-4 rounded bg-blue-600 text-white">
          追加
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map((t) => (
          <li key={t.id} className="border rounded p-2 flex justify-between items-center">
            <span>{t.title}</span>
            <button className="text-sm text-red-600" onClick={() => remove(t.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
