import React, { useState } from "react";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { Badge } from "@/client/components/ui/badge";
import { Lock, ShieldCheck, Sparkles, AlertCircle, LogIn } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const body = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { authenticated: boolean; username: string };
      };

      if (!res.ok || !body.success) {
        setError(body.error || "Credenciais inválidas.");
        return;
      }

      onLoginSuccess(body.data?.username || username.trim());
    } catch {
      setError("Falha de conexão com o Home Server local.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-ui="login-screen"
      className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4"
    >
      <div className="craft-modal-enter w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center text-teal-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Social Panel
              </h1>
              <p className="text-xs text-slate-400">
                Home Server • Controle de Acesso Local
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="text-[11px] border-teal-800/70 bg-teal-950/40 text-teal-300 gap-1"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
            <span>Protegido</span>
          </Badge>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-slate-300 space-y-1">
          <p className="font-medium text-slate-200 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            <span>Sessão Criptografada (Argon2id + Cookie HttpOnly)</span>
          </p>
          <p className="text-slate-400">
            Insira as credenciais do administrador local (<code className="text-teal-300">PANEL_ADMIN_USER</code> / <code className="text-teal-300">PANEL_ADMIN_PASSWORD</code>) para desbloquear o painel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-username" className="text-xs text-slate-300">
              Usuário Administrador
            </Label>
            <Input
              id="login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password" className="text-xs text-slate-300">
              Senha do Home Server
            </Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-800/80 bg-rose-950/40 px-3 py-2 text-xs text-rose-200 flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-semibold active:scale-[0.97]"
          >
            <LogIn className="h-4 w-4" />
            <span>{isSubmitting ? "Verificando credenciais..." : "Desbloquear Painel"}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
