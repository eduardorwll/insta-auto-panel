import React, { useState, useEffect } from "react";
import { useCompany } from "@/client/context/CompanyContext";
import type { PhotoAsset, PhotoCategory } from "@/client/types/photo";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { Badge } from "@/client/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client/components/ui/card";
import { Upload, Trash2, Tag, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";

const CATEGORIES: PhotoCategory[] = ["Especialista", "Produto", "Logo", "Fundo"];

export function PhotoBank() {
  const { activeCompany } = useCompany();
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Upload Form State
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<PhotoCategory>("Especialista");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPhotos = async () => {
    if (!activeCompany) return;
    try {
      setIsLoading(true);
      const url =
        activeCategory === "ALL"
          ? `/api/photos?companyId=${activeCompany.id}`
          : `/api/photos?companyId=${activeCompany.id}&category=${activeCategory}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPhotos(json.data);
      }
    } catch (err: unknown) {
      console.error("Erro ao buscar fotos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [activeCompany?.id, activeCategory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;
    if (!file) {
      setMessage({ type: "error", text: "Selecione uma imagem para enviar." });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyId", activeCompany.id);
      formData.append("category", category);
      if (tags.trim()) {
        const tagArray = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        formData.append("tags", JSON.stringify(tagArray));
      }

      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao realizar upload.");
      }

      setMessage({ type: "success", text: "Foto enviada com sucesso para o acervo!" });
      setFile(null);
      setTags("");
      // Reset input element
      const fileInput = document.getElementById("photo-upload-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      await fetchPhotos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha no envio";
      setMessage({ type: "error", text: msg });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta foto do acervo?")) return;
    try {
      const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      }
    } catch (err: unknown) {
      console.error("Erro ao excluir foto:", err);
    }
  };

  if (!activeCompany) {
    return <div className="text-slate-400 text-center py-10">Nenhuma empresa selecionada.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Formulário de Upload */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-teal-400" />
            <span>Upload de Foto para o Banco Base</span>
          </CardTitle>
          <CardDescription>
            Envie imagens oficiais da empresa ({activeCompany.name}) para serem utilizadas em capas e lâminas internas do carrossel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            {message && (
              <div
                className={`flex items-center gap-2 p-3 rounded-md text-sm border ${
                  message.type === "success"
                    ? "bg-emerald-950/40 border-emerald-800 text-emerald-200"
                    : "bg-red-950/40 border-red-800 text-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="photo-upload-input">Arquivo de Imagem (PNG, JPG, WebP) *</Label>
                <Input
                  id="photo-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="photo-category-select">Categoria *</Label>
                <select
                  id="photo-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PhotoCategory)}
                  className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="photo-tags-input">Tags (separadas por vírgula)</Label>
                <Input
                  id="photo-tags-input"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="rosto, jaleco, clínica"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isUploading} className="gap-2">
                <Upload className="h-4 w-4" />
                {isUploading ? "Enviando Imagem..." : "Enviar para o Acervo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Barra de Filtros por Categoria */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={activeCategory === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("ALL")}
          >
            Todas ({photos.length})
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de Fotos */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Carregando acervo de fotos...</div>
      ) : photos.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900 p-12 text-center space-y-3">
          <ImageIcon className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">
            Nenhuma foto no acervo desta categoria
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Faça upload de fotos do especialista, produtos ou logotipos para compor automaticamente os carrosséis semanais.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-lg border border-slate-800 bg-slate-900 overflow-hidden transition-colors hover:border-slate-700 flex flex-col"
            >
              <div className="aspect-square w-full bg-slate-950 overflow-hidden relative">
                <img
                  src={`/uploads/${photo.filename}`}
                  alt={photo.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
                <button
                  type="button"
                  aria-label="Excluir foto"
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/90 text-slate-300 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <p
                    className="text-xs font-medium text-slate-200 truncate"
                    title={photo.originalName}
                  >
                    {photo.originalName}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {photo.category}
                    </Badge>
                    <span className="text-xs text-slate-400 tabular-nums">
                      Uso: {photo.timesUsed || 0}x
                    </span>
                  </div>
                </div>

                {photo.tags && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 truncate">
                    <Tag className="h-3 w-3 shrink-0 opacity-70" />
                    <span className="truncate">{JSON.parse(photo.tags).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
