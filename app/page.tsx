'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // ログインページにリダイレクト
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">THE WORLD DOOR</h1>
        <p className="text-gray-600">ログインページに移動中...</p>
      </div>
    </div>
  );
}