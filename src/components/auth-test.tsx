"use client";

import { authClient } from "@/lib/auth-client";

interface AuthTestProps {
  user: {
    name: string;
    email: string;
    image?: string;
  } | null;
  isAdmin: boolean;
}

export function AuthTest({ user, isAdmin }: AuthTestProps) {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">NakesPro App</h1>
          <p className="text-gray-600 mb-6">
            Platform website builder untuk tenaga kesehatan
          </p>
          <button
            onClick={handleSignIn}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Login dengan Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Selamat Datang!</h1>

        <div className="mb-6">
          {user.image && (
            <img
              src={user.image}
              alt={user.name}
              className="w-16 h-16 rounded-full mb-4"
            />
          )}
          <p className="text-lg font-medium">{user.name}</p>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {isAdmin ? (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Admin
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                User
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition mb-4"
        >
          Logout
        </button>

        <a
          href="/register"
          className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition text-center"
        >
          Mulai Pesan Website
        </a>
      </div>
    </div>
  );
}
