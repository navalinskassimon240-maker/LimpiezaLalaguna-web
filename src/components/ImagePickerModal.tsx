import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Camera, 
  Image as ImageIcon, 
  FolderOpen, 
  UploadCloud, 
  Link as LinkIcon, 
  Store, 
  Check, 
  Loader2, 
  Search,
  Sparkles,
  Info
} from 'lucide-react';
import { useDevice } from '../utils/useDevice';
import { compressImageFile } from '../utils/imageCompressor';
import { STORE_PRESET_IMAGES, StoreImageItem } from '../data/storeImages';

export interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentImageUrl?: string;
  title?: string;
  subtitle?: string;
}

export function ImagePickerModal({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl = '',
  title = 'Seleccionar Imagen',
  subtitle = 'Elegí cómo querés cargar la foto según tu dispositivo'
}: ImagePickerModalProps) {
  const device = useDevice();
  // Auto-detect mode: mobile (celu) or computer (compu)
  const [activeMode, setActiveMode] = useState<'mobile' | 'computer' | 'catalog'>('mobile');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const [urlInput, setUrlInput] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('Todos');
  const [isDragging, setIsDragging] = useState(false);

  // Hidden native file input refs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Set default mode based on device detection when opening
  useEffect(() => {
    if (isOpen) {
      if (device.isComputer) {
        setActiveMode('computer');
      } else {
        setActiveMode('mobile');
      }
      setPreviewUrl(currentImageUrl);
      setUrlInput(currentImageUrl.startsWith('http') ? currentImageUrl : '');
    }
  }, [isOpen, device.isComputer, currentImageUrl]);

  if (!isOpen) return null;

  // Process selected file with automatic mobile/desktop compression
  const processFile = async (file: File) => {
    if (!file) return;
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccioná un archivo de imagen válido (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setIsProcessing(true);
    try {
      // Compress and optimize
      const compressedBase64 = await compressImageFile(file, 960, 960, 0.84);
      setPreviewUrl(compressedBase64);
      onSelectImage(compressedBase64);
      onClose();
    } catch (err: any) {
      alert('Error al procesar la imagen: ' + (err?.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Drag and drop for desktop / laptop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Apply custom URL
  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
    onSelectImage(urlInput.trim());
    onClose();
  };

  // Select from preset catalog
  const handleSelectCatalogItem = (item: StoreImageItem) => {
    setPreviewUrl(item.path);
    onSelectImage(item.path);
    onClose();
  };

  // Filter catalog images
  const catalogCategories = ['Todos', ...Array.from(new Set(STORE_PRESET_IMAGES.map(i => i.category)))];
  const filteredCatalog = STORE_PRESET_IMAGES.filter(item => {
    const matchesCat = selectedCatalogCategory === 'Todos' || item.category === selectedCatalogCategory;
    const matchesSearch = catalogSearch.trim() === '' || 
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Hidden file inputs with specific mobile/desktop attributes */}
      {/* 1. Mobile Gallery: standard file picker */}
      <input 
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 2. Mobile Camera: direct camera capture */}
      <input 
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 3. Computer / Folders file picker */}
      <input 
        ref={folderInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors active:scale-95"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector / Device Detection Tabs */}
        <div className="px-4 sm:px-5 pt-3 pb-2 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          
          {/* Detected Device Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            {device.isComputer ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-600" />
                <span>Detectado: <strong>Computadora / PC</strong></span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Detectado: <strong>Celular / Móvil</strong></span>
              </>
            )}
          </div>

          {/* User-selectable tabs: Celu / Compu / Catálogo */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveMode('mobile')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeMode === 'mobile'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>📱 Celu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('computer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeMode === 'computer'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>💻 Compu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('catalog')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeMode === 'catalog'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>🏪 Catálogo</span>
            </button>
          </div>

        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Loading state indicator */}
          {isProcessing && (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-sm font-black text-blue-900">
                Optimizando y preparando imagen...
              </p>
              <p className="text-xs text-blue-600">
                Comprimiendo automáticamente para que cargue ultra rápido en cualquier dispositivo.
              </p>
            </div>
          )}

          {/* MODE 1: CELULAR (Galería y Cámara) */}
          {activeMode === 'mobile' && !isProcessing && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5">
                <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 font-medium leading-relaxed">
                  <strong>Modo Celular Activado:</strong> Podés elegir una foto de la galería de tu celular o sacarle una foto directamente con la cámara trasera/frontal.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Galería de fotos */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center text-center gap-2.5 group cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-900">
                      Galería del Celular
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      Abrir álbum de fotos guardadas
                    </span>
                  </div>
                </button>

                {/* 2. Tomar foto con la cámara */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-center gap-2.5 group cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-900">
                      Sacar Foto con la Cámara
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      Tomar foto en vivo con el celular
                    </span>
                  </div>
                </button>
              </div>

              {/* Botón rápido a catálogo */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveMode('catalog')}
                  className="text-xs font-bold text-slate-600 hover:text-emerald-700 inline-flex items-center gap-1.5 underline underline-offset-4"
                >
                  <Store className="w-4 h-4" />
                  <span>O tocar acá para elegir entre las fotos ya existentes del local</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: COMPUTADORA (Carpetas / Explorador y Drag & Drop) */}
          {activeMode === 'computer' && !isProcessing && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 flex items-start gap-2.5">
                <Monitor className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-950 font-medium leading-relaxed">
                  <strong>Modo Computadora Activado:</strong> Podés buscar fotos en las carpetas de tu compu (Windows / Mac) o arrastrar un archivo directamente adentro del recuadro.
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => folderInputRef.current?.click()}
                className={`p-8 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer ${
                  isDragging
                    ? 'border-blue-600 bg-blue-50 scale-[1.01]'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Hacé clic acá para abrir tus Carpetas
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    O arrastrá y soltá una imagen desde cualquier carpeta de tu compu
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs hover:border-blue-400">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>Explorar Carpetas...</span>
                </span>
              </div>

              {/* Botón rápido a catálogo */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveMode('catalog')}
                  className="text-xs font-bold text-slate-600 hover:text-blue-700 inline-flex items-center gap-1.5 underline underline-offset-4"
                >
                  <Store className="w-4 h-4" />
                  <span>O tocar acá para elegir entre las fotos ya existentes del catálogo</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: CATÁLOGO DE FOTOS DEL LOCAL (/IMG/...) */}
          {activeMode === 'catalog' && !isProcessing && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Buscar foto (ej: cloro, combo...)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
                  {catalogCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCatalogCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                        selectedCatalogCategory === cat
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredCatalog.map(item => {
                  const isCurrent = previewUrl === item.path;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectCatalogItem(item)}
                      className={`relative rounded-2xl p-2 border-2 transition-all cursor-pointer flex flex-col items-center text-center group ${
                        isCurrent
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-blue-400 bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="w-full h-20 rounded-xl overflow-hidden bg-slate-100 mb-2 flex items-center justify-center">
                        <img 
                          src={item.path} 
                          alt={item.name}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-slate-800 line-clamp-1 leading-tight">
                        {item.name}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                        {item.category}
                      </span>
                      {isCurrent && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COMMON SECTION: O PEGAR URL DE IMAGEN */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
              O pegar enlace / URL de imagen web
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg o /IMG/archivo.png"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!urlInput.trim()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Aplicar URL
              </button>
            </div>
          </div>

          {/* Live Preview Box */}
          {previewUrl && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-xs">
                <img 
                  src={previewUrl} 
                  alt="Vista previa" 
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Imagen seleccionada</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {previewUrl.startsWith('data:') ? 'Foto subida y optimizada' : previewUrl}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            Cancelar
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={() => {
                onSelectImage(previewUrl);
                onClose();
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Usar esta Imagen</span>
            </button>
          )}
        </div>

      </div>

    </div>,
    document.body
  );
}
