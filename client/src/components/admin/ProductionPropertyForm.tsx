// Production Property Form Component - SESUAI REQUEST USER
// Maps to EXISTING properties table columns - NO MODIFICATIONS TO TABLE
// Uses existing columns + extension columns from migration

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { MultiImageDropzone } from "@/components/MultiImageDropzone";
import html2canvas from "html2canvas";
import { 
  Home, 
  MapPin, 
  DollarSign, 
  FileText, 
  CheckCircle,
  Building2,
  Building,
  Warehouse,
  Trees,
  Store,
  Castle,
  Eye,
  EyeOff,
  Upload,
  X,
  RefreshCw,
  Plus,
  Trash2,
  Download
} from "lucide-react";

// PROPERTY TYPES - maps to properties.jenis_properti
const PROPERTY_TYPES = [
  { value: "rumah", label: "Rumah" },
  { value: "tanah", label: "Tanah" },
  { value: "kost", label: "Kost" },
  { value: "hotel", label: "Hotel" },
  { value: "homestay", label: "Homestay / Guesthouse" },
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Apartment" },
  { value: "gudang", label: "Gudang" },
  { value: "komersial", label: "Bangunan Komersial" },
];

// LEGALITAS - sesuai request user
const LEGALITAS_OPTIONS = [
  { value: "SHM & IMB", label: "SHM & IMB / PBG Lengkap" },
  { value: "SHGB & IMB", label: "SHGB & IMB / PBG Lengkap (Berlaku Sampai: [tgl])" },
  { value: "SHM Saja", label: "SHM Pekarangan Saja Tanpa IMB / PBG" },
  { value: "SHM Sawah", label: "SHM Sawah / Tegalan" },
  { value: "SHGB Saja", label: "SHGB Saja Tanpa IMB / PBG" },
  { value: "Girik", label: "Girik / Letter C / PPJB / dll" },
  { value: "Izin Usaha", label: "Izin Usaha" },
];

// JENIS HOTEL - sesuai request user
const JENIS_HOTEL_OPTIONS = [
  { value: "Budget", label: "Budget / Melati" },
  { value: "Bintang 1", label: "Bintang 1" },
  { value: "Bintang 2", label: "Bintang 2" },
  { value: "Bintang 3", label: "Bintang 3" },
  { value: "Bintang 4", label: "Bintang 4" },
  { value: "Bintang 5", label: "Bintang 5" },
  { value: "Boutique", label: "Boutique" },
];

interface OwnerData {
  nama_lengkap: string;
  no_ktp: string;
  alamat_ktp: string;
  whatsapp_1: string;
}

interface AgreementData {
  agreement_type: string;
  exclusive_booster_duration_months: number;
  meta_ads_enabled: boolean;
  tiktok_ads_enabled: boolean;
}

interface ProductionPropertyFormProps {
  property?: any;
  sourceInput: 'ADMIN' | 'OWNER';
  ownerData?: OwnerData | null;
  agreementData?: AgreementData | null;
  onSuccess?: (propertyId: string, goToComplete?: boolean) => void;
}

export function ProductionPropertyForm({ 
  property, 
  sourceInput = 'ADMIN',
  ownerData,
  agreementData,
  onSuccess 
}: ProductionPropertyFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    // Core fields
    kode_listing: property?.kode_listing || property?.kodeListing || "",
    judul_properti: property?.judul_properti || property?.judulProperti || "",
    deskripsi: property?.deskripsi || "",
    harga_properti: property?.harga_properti || property?.hargaProperti || "",
    harga_per_meter: property?.harga_per_meter || property?.hargaPerMeter || false,
    price_old: property?.price_old || property?.priceOld || "",
    luas_tanah: property?.luas_tanah || property?.luasTanah || "",
    luas_bangunan: property?.luas_bangunan || property?.luasBangunan || "",
    kamar_tidur: property?.kamar_tidur || property?.kamarTidur || "",
    kamar_mandi: property?.kamar_mandi || property?.kamarMandi || "",
    jenis_properti: property?.jenis_properti || property?.jenisProperti || "",
    legalitas: property?.legalitas || "",
    shgb_expired_at: property?.shgb_expired_at || "",
    provinsi: property?.provinsi || property?.Provinsi || "",
    kabupaten: property?.kabupaten || "",
    kecamatan: property?.kecamatan || "",
    kelurahan: property?.kelurahan || "",
    alamat_lengkap: property?.alamat_lengkap || property?.alamatLengkap || "",
    
    // Images
    image_url: property?.image_url || "",
    image_url1: property?.image_url1 || "",
    image_url2: property?.image_url2 || "",
    image_url3: property?.image_url3 || "",
    image_url4: property?.image_url4 || "",
    image_url5: property?.image_url5 || "",
    image_url6: property?.image_url6 || "",
    image_url7: property?.image_url7 || "",
    image_url8: property?.image_url8 || "",
    image_url9: property?.image_url9 || "",
    youtube_url: property?.youtube_url || "",
    
    // Status - Updated: multiple selections allowed
    status_dijual: property?.status === "dijual" || property?.status === "dijual_disewakan" || false,
    status_disewakan: property?.status === "disewakan" || property?.status === "dijual_disewakan" || false,
    
    // Owner Contact
    owner_contact: property?.owner_contact || "",
    
    // Labels
    is_hot: property?.is_hot || false,
    is_sold: property?.is_sold || false,
    is_property_pilihan: property?.is_property_pilihan || false,
    is_premium: property?.is_premium || false,
    is_featured: property?.is_featured || false,
    
    // Meta
    meta_title: property?.meta_title || "",
    meta_description: property?.meta_description || "",
    
    // Extension fields
    lebar_depan: property?.lebar_depan || "",
    jumlah_lantai: property?.jumlah_lantai || "",
    jenis_kost: property?.jenis_kost || "",
    jenis_hotel: property?.jenis_hotel || "",
    ruang_penjaga: property?.ruang_penjaga || false,
    token_listrik_perkamar: property?.token_listrik_perkamar || false,
    no_unit: property?.no_unit || "",
    kelengkapan: property?.kelengkapan || "",
    status_legalitas: property?.status_legalitas || "On Hand",
    bank_terkait: property?.bank_terkait || "",
    outstanding_bank: property?.outstanding_bank || "",
    dekat_sungai: property?.dekat_sungai || false,
    jarak_sungai: property?.jarak_sungai || "",
    dekat_makam: property?.dekat_makam || false,
    jarak_makam: property?.jarak_makam || "",
    dekat_sutet: property?.dekat_sutet || false,
    jarak_sutet: property?.jarak_sutet || "",
    lebar_jalan: property?.lebar_jalan || "",
    alasan_dijual: property?.alasan_dijual || "",
    
    // Price variants
    harga_sewa_tahunan: property?.harga_sewa_tahunan || "",
    harga_nego: property?.harga_nego !== false,
    harga_nett: property?.harga_nett || false,
    
    // Income/Operational
    income_per_bulan: property?.income_per_bulan || "",
    biaya_pengeluaran_per_bulan: property?.biaya_pengeluaran_per_bulan || "",
    harga_sewa_kamar: property?.harga_sewa_kamar || "",
    
    // Google Maps (admin only - not on homepage)
    google_maps_link: property?.google_maps_link || "",
    
    // Source tracking
    source_input: sourceInput,
    publish_status: property?.publish_status || (sourceInput === 'OWNER' ? 'PENDING_REVIEW' : 'APPROVED'),
    
    // Agreement
    agreement_status: property?.agreement_status || "none",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleMaps, setShowGoogleMaps] = useState(false);
  const [submittedProperties, setSubmittedProperties] = useState<string[]>([]);
  const [showAddAnother, setShowAddAnother] = useState(false);
  const [showAgreementPreview, setShowAgreementPreview] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [ownerSignature, setOwnerSignature] = useState<string>('');
  const [savedAgreementUrl, setSavedAgreementUrl] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const agreementPreviewRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  // Update form when property prop changes (e.g., when editing different property)
  useEffect(() => {
    if (property?.id) {
      setFormData({
        // Core fields
        kode_listing: property?.kode_listing || property?.kodeListing || "",
        judul_properti: property?.judul_properti || property?.judulProperti || "",
        deskripsi: property?.deskripsi || "",
        harga_properti: property?.harga_properti || property?.hargaProperti || "",
        harga_per_meter: property?.harga_per_meter || property?.hargaPerMeter || false,
        price_old: property?.price_old || property?.priceOld || "",
        luas_tanah: property?.luas_tanah || property?.luasTanah || "",
        luas_bangunan: property?.luas_bangunan || property?.luasBangunan || "",
        kamar_tidur: property?.kamar_tidur || property?.kamarTidur || "",
        kamar_mandi: property?.kamar_mandi || property?.kamarMandi || "",
        jenis_properti: property?.jenis_properti || property?.jenisProperti || "",
        legalitas: property?.legalitas || "",
        shgb_expired_at: property?.shgb_expired_at || property?.shgbExpiredAt || "",
        provinsi: property?.provinsi || property?.Provinsi || "",
        kabupaten: property?.kabupaten || "",
        kecamatan: property?.kecamatan || "",
        kelurahan: property?.kelurahan || "",
        alamat_lengkap: property?.alamat_lengkap || property?.alamatLengkap || "",
        
        // Images
        image_url: property?.image_url || property?.imageUrl || "",
        image_url1: property?.image_url1 || property?.imageUrl1 || "",
        image_url2: property?.image_url2 || property?.imageUrl2 || "",
        image_url3: property?.image_url3 || property?.imageUrl3 || "",
        image_url4: property?.image_url4 || property?.imageUrl4 || "",
        image_url5: property?.image_url5 || property?.imageUrl5 || "",
        image_url6: property?.image_url6 || property?.imageUrl6 || "",
        image_url7: property?.image_url7 || property?.imageUrl7 || "",
        image_url8: property?.image_url8 || property?.imageUrl8 || "",
        image_url9: property?.image_url9 || property?.imageUrl9 || "",
        youtube_url: property?.youtube_url || "",
        
        // Status
        status_dijual: property?.status === "dijual" || property?.status === "dijual_disewakan" || false,
        status_disewakan: property?.status === "disewakan" || property?.status === "dijual_disewakan" || false,
        
        // Owner Contact
        owner_contact: property?.owner_contact || property?.ownerContact || "",
        
        // Labels
        is_hot: property?.is_hot || false,
        is_sold: property?.is_sold || false,
        is_property_pilihan: property?.is_property_pilihan || false,
        is_premium: property?.is_premium || false,
        is_featured: property?.is_featured || false,
        
        // Meta
        meta_title: property?.meta_title || "",
        meta_description: property?.meta_description || "",
        
        // Extension fields
        kelengkapan: property?.kelengkapan || "",
        status_legalitas: property?.status_legalitas || "On Hand",
        lebar_depan: property?.lebar_depan || "",
        jumlah_lantai: property?.jumlah_lantai || "",
        jenis_kost: property?.jenis_kost || "",
        jenis_hotel: property?.jenis_hotel || "",
        ruang_penjaga: property?.ruang_penjaga || false,
        token_listrik_perkamar: property?.token_listrik_perkamar || false,
        no_unit: property?.no_unit || "",
        bank_terkait: property?.bank_terkait || "",
        outstanding_bank: property?.outstanding_bank || "",
        dekat_sungai: property?.dekat_sungai || false,
        jarak_sungai: property?.jarak_sungai || "",
        dekat_makam: property?.dekat_makam || false,
        jarak_makam: property?.jarak_makam || "",
        dekat_sutet: property?.dekat_sutet || false,
        jarak_sutet: property?.jarak_sutet || "",
        lebar_jalan: property?.lebar_jalan || "",
        alasan_dijual: property?.alasan_dijual || "",
        
        // Price variants
        harga_sewa_tahunan: property?.harga_sewa_tahunan || "",
        harga_nego: property?.harga_nego !== false,
        harga_nett: property?.harga_nett || false,
        
        // Income/Operational
        income_per_bulan: property?.income_per_bulan || "",
        biaya_pengeluaran_per_bulan: property?.biaya_pengeluaran_per_bulan || "",
        harga_sewa_kamar: property?.harga_sewa_kamar || "",
        
        // Google Maps
        google_maps_link: property?.google_maps_link || "",
        
        // Source tracking
        source_input: property?.source_input || sourceInput,
        publish_status: property?.publish_status || (sourceInput === 'OWNER' ? 'PENDING_REVIEW' : 'APPROVED'),
        
        // Agreement
        agreement_status: property?.agreement_status || "none",
      });
    }
  }, [property?.id]);

  // Resize canvas to match CSS size - 1:1 mapping for accurate coordinate tracking
  const resizeCanvas = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Set internal resolution to match CSS size 1:1 (no pixel ratio scaling)
    // This ensures coordinates from getBoundingClientRect() map directly
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Set drawing styles
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Initialize signature canvas
  useEffect(() => {
    if (showAgreementPreview && signatureCanvasRef.current) {
      resizeCanvas();
    }
  }, [showAgreementPreview, resizeCanvas]);

  // Get canvas-relative coordinates
  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setLastPos(coords);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const coords = getCanvasCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setLastPos(coords);
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);
    if (signatureCanvasRef.current) {
      setOwnerSignature(signatureCanvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    if (signatureCanvasRef.current) {
      const ctx = signatureCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height);
        setOwnerSignature('');
      }
    }
  };

  // Generate PDF from agreement
  const generatePDF = () => {
    const agreementContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Perjanjian Jasa Pemasaran - ${formData.kode_listing || 'SBP'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 16px; margin: 0; }
          .section { margin-bottom: 15px; }
          .section-title { font-weight: bold; margin-bottom: 5px; }
          .party { border: 1px solid #000; padding: 10px; margin-bottom: 10px; }
          .signature-area { margin-top: 30px; display: flex; justify-content: space-between; }
          .signature-box { width: 45%; text-align: center; }
          .signature-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 5px; }
          .stamp-area { position: relative; width: 250px; height: 160px; margin: 10px auto; }
          .stamp-img { position: absolute; width: 140px; bottom: 0; left: 0; }
          .ttd-img { position: absolute; width: 170px; bottom: 15px; left: 35px; }
          .agent-ttd { width: 200px; margin-top: 20px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PERJANJIAN JASA PEMASARAN</h1>
          <h2>SALAM BUMI PROPERTY</h2>
          <p>${agreementData?.agreement_type === 'exclusive_booster' ? `( EXCLUSIVE BOOSTER – KONTRAK ${agreementData?.exclusive_booster_duration_months || 6} BULAN )` : '( OPEN LISTING – PEMASARAN BEBAS )'}</p>
          <p>Nomor: ${formData.kode_listing || 'AUTO-GENERATE'}</p>
        </div>
        
        <p>Pada hari ini, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, telah dibuat dan disepakati Perjanjian Jasa Pemasaran Properti antara:</p>
        
        <div class="section">
          <div class="party">
            <div class="section-title">PIHAK PERTAMA</div>
            <div><strong>Nama Perusahaan :</strong> CV Salam Bumi Property</div>
            <div><strong>Alamat Kantor :</strong> Jl Pajajaran, Catur Tunggal, Depok, Sleman (Sekarang Menggunakan Virtual Office)</div>
            <div><strong>Telp / WhatsApp :</strong> 0813-9127-8889</div>
            <div><strong>Email :</strong> salambumiproperty@gmail.com</div>
            <div><strong>Website :</strong> salambumi.xyz</div>
            <p>Dalam hal ini bertindak sebagai Penyedia Jasa Pemasaran Properti, selanjutnya disebut PIHAK PERTAMA.</p>
          </div>
        </div>
        
        <div class="section">
          <div class="party">
            <div class="section-title">PIHAK KEDUA</div>
            <div><strong>Nama :</strong> ${ownerData?.nama_lengkap || '[Nama Pemilik]'}</div>
            <div><strong>No. KTP :</strong> ${ownerData?.no_ktp || '[No. KTP]'}</div>
            <div><strong>Alamat KTP :</strong> ${ownerData?.alamat_ktp || '[Alamat KTP]'}</div>
            <p>Dalam hal ini bertindak sebagai Pemilik Properti, selanjutnya disebut PIHAK KEDUA.</p>
            <p>PIHAK PERTAMA dan PIHAK KEDUA selanjutnya secara bersama-sama disebut para Pihak.</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 1 - OBJEK PERJANJIAN</div>
          <p>PIHAK KEDUA memberikan hak pemasaran secara ${agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE' : 'BEBAS / TIDAK TERIKAT'} kepada PIHAK PERTAMA untuk memasarkan properti milik PIHAK KEDUA dengan data sebagai berikut:</p>
          <div style="background: #f5f5f5; padding: 10px;">
            <div><strong>Jenis Properti :</strong> ${formData.jenis_properti || '-'}</div>
            <div><strong>Sertifikat :</strong> ${formData.legalitas || '-'}</div>
            <div><strong>Alamat :</strong> ${formData.alamat_lengkap || `${formData.kelurahan || ''}, ${formData.kecamatan || ''}, ${formData.kabupaten || ''}, ${formData.provinsi || ''}`}</div>
            <div><strong>Harga Penawaran :</strong> ${formData.harga_properti ? `Rp ${parseInt(formData.harga_properti).toLocaleString('id-ID')}` : '-'} ${formData.harga_nego ? 'Nego' : ''} ${formData.harga_nett ? 'Nett' : ''}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 2 - JENIS LISTING DAN MASA KONTRAK</div>
          <p>Jenis listing yang disepakati adalah ${agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE LISTING' : 'OPEN LISTING'}.</p>
          ${agreementData?.agreement_type === 'exclusive_booster' ? `<p>Masa kontrak berlaku selama ${agreementData?.exclusive_booster_duration_months || 6} bulan, terhitung sejak tanggal ditandatanganinya perjanjian ini.</p>` : ''}
          ${agreementData?.agreement_type !== 'exclusive_booster' ? `<p>PIHAK KEDUA boleh dan bebas memasarkan propertinya sendiri atau melalui Agent / Perantara Lain selain kepada PIHAK PERTAMA.</p>` : ''}
          ${agreementData?.agreement_type !== 'exclusive_booster' ? `<p>Apabila properti terjual oleh calon pembeli dari PIHAK PERTAMA, maka PIHAK KEDUA wajib membayarkan fee 3% dari harga deal penjualan kepada pihak pertama.</p>` : ''}
          ${agreementData?.agreement_type === 'exclusive_booster' ? '<p>Apabila properti terjual selama masa kontrak, maka transaksi tersebut tetap dianggap sebagai hasil kerja PIHAK PERTAMA.</p>' : ''}
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 3 - KETENTUAN FEE / KOMISI</div>
          <p>PIHAK KEDUA menyetujui membayar fee atau komisi sebesar 3% (tiga persen) dari harga deal PENJUALAN kepada PIHAK PERTAMA jika PIHAK PERTAMA berhasil menjualkan properti milik PIHAK KEDUA.</p>
          <p>Pembayaran fee dilakukan selambat-lambatnya 3 (tiga) hari setelah:</p>
          <ul>
            <li>Akta Jual Beli (AJB) ditandatangani, atau</li>
            <li>Apabila transaksi dilakukan secara tunai bertahap, maka pembayaran fee dilakukan setelah pembayaran mencapai minimal 30% (Down Payment) dari total harga.</li>
          </ul>
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 5 - KEWAJIBAN PIHAK PERTAMA</div>
          <ul>
            <li>Melakukan pemasaran properti secara profesional dan maksimal</li>
            <li>Menyusun strategi pemasaran sesuai standar Salam Bumi Property</li>
            <li>Memberikan laporan pemasaran secara berkala kepada PIHAK KEDUA</li>
          </ul>
          <div class="section-title">KEWAJIBAN PIHAK KEDUA</div>
          <ul>
            <li>Menyediakan data dan dokumen legalitas properti yang benar dan sah</li>
            <li>Memberikan akses yang diperlukan untuk kepentingan pemasaran</li>
            <li>Membayar fee sesuai ketentuan perjanjian ini</li>
          </ul>
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 6 - PENYELESAIAN SENGKETA</div>
          <p>Apabila terjadi perselisihan, para Pihak kesepakatan menyelesaikannya terlebih dahulu secara musyawarah untuk mufakat. Apabila tidak tercapai, diselesaikan melalui jalur hukum di wilayah hukum setempat.</p>
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 7 - LAIN-LAIN</div>
          <ul>
            <li>Perjanjian ini mulai berlaku sejak ditandatangani oleh Para Pihak</li>
            <li>Perubahan atau penambahan hanya sah apabila dibuat secara tertulis dan disepakati oleh Para Pihak</li>
            <li>Perjanjian ini dibuat dalam 2 (dua) rangkap, masing-masing mempunyai kekuatan hukum yang sama</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          Yogyakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        
        <div class="signature-area">
          <div class="signature-box">
            <div>Yang Memberi Persetujuan</div>
            <div class="stamp-area">
              <img src="https://images.salambumi.xyz/materai/hg.png" class="stamp-img" />
              ${ownerSignature ? `<img src="${ownerSignature}" class="ttd-img" style="mix-blend-mode: multiply;" />` : ''}
            </div>
            <div class="signature-line">( ${ownerData?.nama_lengkap || '[Nama Pemilik]'} )</div>
          </div>
          
          <div class="signature-box">
            <div>Agent Pemasaran</div>
            <img src="https://images.salambumi.xyz/materai/gsd-removebg-preview%20-%20Copy.png" class="agent-ttd" />
            <div class="signature-line">( ARDY SALAM )</div>
            <div style="font-size: 10px; color: #666;">Salam Bumi Property</div>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding: 10px; background: #fffde7; font-size: 10px;">
          <strong>Catatan:</strong>
          <ul>
            <li>Tanda tangan ini sah secara hukum</li>
            <li>Pembayaran fee dilakukan setelah AJB ditandatangani</li>
            <li>50% dari booking fee akan diberikan ke agen jika pembatalan bukan caused by agent</li>
          </ul>
        </div>
      </body>
      </html>
    `;
    
    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(agreementContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    toast({
      title: "Mengunduh PDF",
      description: "Membuka dialog cetak. Pilih 'Simpan sebagai PDF' untuk menyimpan.",
      duration: 3000
    });
  };

  // Capture agreement preview as WebP image
  const captureAgreementPreview = async () => {
    if (!agreementPreviewRef.current) {
      toast({
        title: "Error",
        description: "Tidak dapat mengambil preview",
        variant: "destructive"
      });
      return;
    }

    if (!ownerSignature) {
      toast({
        title: "Error",
        description: "Silakan tanda tangan terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    setIsCapturing(true);
    try {
      const canvas = await html2canvas(agreementPreviewRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Convert to WebP
      const webpDataUrl = canvas.toDataURL('image/webp', 0.8);
      
      // Convert base64 to blob for upload
      const base64Data = webpDataUrl.split(',')[1];
      if (!base64Data) throw new Error('Failed to convert image');
      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/webp' });

      // Upload to Supabase Storage
      const fileName = `agreement_${formData.kode_listing || 'preview'}_${Date.now()}.webp`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('agreements')
        .upload(fileName, blob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('agreements')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      setSavedAgreementUrl(publicUrl);

      toast({
        title: "Berhasil",
        description: "Preview perjanjian berhasil disimpan sebagai WebP",
        duration: 3000
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Error capturing agreement:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menyimpan preview perjanjian",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  };

  // Download agreement as image
  const downloadAgreementImage = async (format: 'webp' | 'png' = 'webp') => {
    if (!agreementPreviewRef.current) return;

    setIsCapturing(true);
    try {
      const canvas = await html2canvas(agreementPreviewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, 0.9);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `perjanjian_${formData.kode_listing || 'preview'}.${format}`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Berhasil",
        description: `Preview berhasil diunduh sebagai ${format.toUpperCase()}`,
        duration: 3000
      });
    } catch (error: any) {
      console.error('Error downloading agreement:', error);
      toast({
        title: "Error",
        description: "Gagal mengunduh preview",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  };

  // Auto-generate kode listing on mount if not editing
  useEffect(() => {
    if (!property?.id && !formData.kode_listing) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const uniqueCode = `SBP-${timestamp}-${randomPart}`;
      handleChange("kode_listing", uniqueCode);
    }
  }, []);

  // Reset form for adding another property (keeps agreement/owner info)
  const handleAddAnotherProperty = () => {
    // Generate new kode listing for new property
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKode = `SBP-${timestamp}-${randomPart}`;
    
    setFormData(prev => ({
      ...prev,
      kode_listing: newKode,
      judul_properti: "",
      deskripsi: "",
      harga_properti: "",
      luas_tanah: "",
      luas_bangunan: "",
      kamar_tidur: "",
      kamar_mandi: "",
      jenis_properti: "",
      legalitas: "",
      shgb_expired_at: "",
      provinsi: prev.provinsi, // Keep owner location
      kabupaten: prev.kabupaten,
      kecamatan: prev.kecamatan,
      kelurahan: prev.kelurahan,
      alamat_lengkap: "",
      image_url: "",
      image_url1: "",
      image_url2: "",
      image_url3: "",
      image_url4: "",
      image_url5: "",
      image_url6: "",
      image_url7: "",
      image_url8: "",
      image_url9: "",
      youtube_url: "",
      status_dijual: false,
      status_disewakan: false,
      harga_sewa_tahunan: "",
      harga_nego: true,
      harga_nett: false,
      is_hot: false,
      is_sold: false,
      is_property_pilihan: false,
      is_premium: false,
      is_featured: false,
      lebar_depan: "",
      jumlah_lantai: "",
      jenis_kost: "",
      jenis_hotel: "",
      ruang_penjaga: false,
      token_listrik_perkamar: false,
      no_unit: "",
      kelengkapan: "",
      status_legalitas: "On Hand",
      bank_terkait: "",
      outstanding_bank: "",
      dekat_sungai: false,
      jarak_sungai: "",
      dekat_makam: false,
      jarak_makam: "",
      dekat_sutet: false,
      jarak_sutet: "",
      lebar_jalan: "",
      alasan_dijual: "",
      income_per_bulan: "",
      biaya_pengeluaran_per_bulan: "",
      harga_sewa_kamar: "",
      google_maps_link: "",
    }));
    
    setShowAddAnother(false);
    setSubmittedProperties([]);
    
    toast({
      title: "Form Properti Baru",
      description: `Properti ke-${submittedProperties.length + 2} - Isi data properti baru`,
      duration: 3000
    });
  };

  // Parse currency to number
  const parseCurrency = (value: string): string => {
    return String(value).replace(/[^\d]/g, '');
  };

  // Reset form completely
  const handleResetForm = () => {
    setFormData({
      kode_listing: "",
      judul_properti: "",
      deskripsi: "",
      harga_properti: "",
      harga_per_meter: false,
      price_old: "",
      luas_tanah: "",
      luas_bangunan: "",
      kamar_tidur: "",
      kamar_mandi: "",
      jenis_properti: "",
      legalitas: "",
      shgb_expired_at: "",
      provinsi: "",
      kabupaten: "",
      kecamatan: "",
      kelurahan: "",
      alamat_lengkap: "",
      image_url: "",
      image_url1: "",
      image_url2: "",
      image_url3: "",
      image_url4: "",
      image_url5: "",
      image_url6: "",
      image_url7: "",
      image_url8: "",
      image_url9: "",
      youtube_url: "",
      status_dijual: false,
      status_disewakan: false,
      owner_contact: "",
      is_hot: false,
      is_sold: false,
      is_property_pilihan: false,
      is_premium: false,
      is_featured: false,
      meta_title: "",
      meta_description: "",
      lebar_depan: "",
      jumlah_lantai: "",
      jenis_kost: "",
      jenis_hotel: "",
      ruang_penjaga: false,
      token_listrik_perkamar: false,
      no_unit: "",
      kelengkapan: "",
      status_legalitas: "On Hand",
      bank_terkait: "",
      outstanding_bank: "",
      dekat_sungai: false,
      jarak_sungai: "",
      dekat_makam: false,
      jarak_makam: "",
      dekat_sutet: false,
      jarak_sutet: "",
      lebar_jalan: "",
      alasan_dijual: "",
      harga_sewa_tahunan: "",
      harga_nego: true,
      harga_nett: false,
      income_per_bulan: "",
      biaya_pengeluaran_per_bulan: "",
      harga_sewa_kamar: "",
      google_maps_link: "",
      source_input: sourceInput,
      publish_status: sourceInput === 'OWNER' ? 'PENDING_REVIEW' : 'APPROVED',
      agreement_status: "none",
    });
    setShowAddAnother(false);
    setSubmittedProperties([]);
  };

  // Auto-generate unique random listing code
  const generateRandomKode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const uniqueCode = `SBP-${timestamp}-${randomPart}`;
    handleChange("kode_listing", uniqueCode);
  };

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePriceChange = (field: string, value: string) => {
    handleChange(field, parseCurrency(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jenis_properti) {
      toast({ title: "Validasi Gagal", description: "Pilih jenis properti", variant: "destructive" });
      return;
    }

    // Validate required location fields
    if (!formData.provinsi || formData.provinsi.trim() === "") {
      toast({ title: "Validasi Gagal", description: "Provinsi wajib diisi", variant: "destructive" });
      return;
    }

    if (!formData.kabupaten || formData.kabupaten.trim() === "") {
      toast({ title: "Validasi Gagal", description: "Kabupaten/Kota wajib diisi", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine status based on checkboxes
      let status = "dijual";
      if (formData.status_dijual && formData.status_disewakan) {
        status = "dijual_disewakan";
      } else if (formData.status_disewakan) {
        status = "disewakan";
      }

      const payload: any = {
        kode_listing: formData.kode_listing || null,
        judul_properti: formData.judul_properti || null,
        deskripsi: formData.deskripsi || null,
        harga_properti: formData.harga_properti ? parseCurrency(formData.harga_properti) : null,
        price_old: formData.price_old ? parseCurrency(formData.price_old) : null,
        luas_tanah: formData.luas_tanah ? parseFloat(formData.luas_tanah) : null,
        luas_bangunan: formData.luas_bangunan ? parseFloat(formData.luas_bangunan) : null,
        kamar_tidur: formData.kamar_tidur ? parseInt(formData.kamar_tidur) : null,
        kamar_mandi: formData.kamar_mandi ? parseInt(formData.kamar_mandi) : null,
        jenis_properti: formData.jenis_properti,
        legalitas: formData.legalitas || null,
        // Note: shgb_expired_at removed - column doesn't exist in database
        provinsi: formData.provinsi || null,
        kabupaten: formData.kabupaten || null,
        kecamatan: formData.kecamatan || null,
        kelurahan: formData.kelurahan || null,
        alamat_lengkap: formData.alamat_lengkap || null,
        
        // Images
        image_url: formData.image_url || null,
        image_url1: formData.image_url1 || null,
        image_url2: formData.image_url2 || null,
        image_url3: formData.image_url3 || null,
        image_url4: formData.image_url4 || null,
        image_url5: formData.image_url5 || null,
        image_url6: formData.image_url6 || null,
        image_url7: formData.image_url7 || null,
        image_url8: formData.image_url8 || null,
        image_url9: formData.image_url9 || null,
        youtube_url: formData.youtube_url || null,
        
        // Status
        status: status,
        
        // Labels
        is_hot: formData.is_hot,
        is_sold: formData.is_sold,
        is_property_pilihan: formData.is_property_pilihan,
        is_premium: formData.is_premium,
        is_featured: formData.is_featured,
        
        // Owner Contact
        owner_contact: formData.owner_contact || null,
        
        // Extension fields
        kelengkapan: formData.kelengkapan || null,
        status_legalitas: formData.status_legalitas || 'On Hand',
        jenis_kost: formData.jenis_kost || null,
        jumlah_lantai: formData.jumlah_lantai ? parseInt(formData.jumlah_lantai) : null,
        lebar_depan: formData.lebar_depan ? parseFloat(formData.lebar_depan) : null,
        no_unit: formData.no_unit || null,
        bank_terkait: formData.bank_terkait || null,
        outstanding_bank: formData.outstanding_bank ? parseCurrency(formData.outstanding_bank) : null,
        google_maps_link: formData.google_maps_link || null,
        harga_sewa_tahunan: formData.harga_sewa_tahunan ? parseCurrency(formData.harga_sewa_tahunan) : null,
        harga_sewa_kamar: formData.harga_sewa_kamar ? parseCurrency(formData.harga_sewa_kamar) : null,
        income_per_bulan: formData.income_per_bulan ? parseCurrency(formData.income_per_bulan) : null,
        biaya_pengeluaran_per_bulan: formData.biaya_pengeluaran_per_bulan ? parseCurrency(formData.biaya_pengeluaran_per_bulan) : null,
        alasan_dijual: formData.alasan_dijual || null,
      };

      let result;
      
      if (property?.id) {
        result = await supabase
          .from('properties')
          .update(payload)
          .eq('id', property.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('properties')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Track submitted property
      const newPropertyId = result.data?.id;
      if (newPropertyId) {
        setSubmittedProperties(prev => [...prev, newPropertyId]);
      }

      toast({ 
        title: "Berhasil", 
        description: sourceInput === 'OWNER' 
          ? "Properti berhasil diajukan, tunggu persetujuan admin" 
          : "Properti berhasil disimpan",
        duration: 5000
      });

      // Show "Tambah Properti Lain" button after successful submit
      setShowAddAnother(true);

      // For ADMIN mode, call onSuccess immediately with skipComplete=true. 
      // For OWNER mode, onSuccess will be called after agreement is signed (in the modal)
      if (onSuccess && sourceInput === 'ADMIN') {
        onSuccess(result.data?.id, true);
      }
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast({ title: "Error", description: error?.message || "Gagal menyimpan properti", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render dynamic fields based on property type
  const renderDynamicFields = () => {
    switch (formData.jenis_properti) {
      case "rumah":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Luas Tanah (m²) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} placeholder="150" />
            </div>
            <div>
              <Label>Luas Bangunan (m²) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} placeholder="100" />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} placeholder="8" />
            </div>
            <div>
              <Label>Jumlah Lantai</Label>
              <Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} placeholder="2" />
            </div>
            <div>
              <Label>Jumlah Kamar Tidur</Label>
              <Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} placeholder="3" />
            </div>
            <div>
              <Label>Jumlah Kamar Mandi</Label>
              <Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} placeholder="2" />
            </div>
          </div>
        );

      case "tanah":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Luas Tanah (m²) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} placeholder="500" />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} placeholder="20" />
            </div>
          </div>
        );

      case "kost":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Jenis Kost <span className="text-red-500">*</span></Label>
                <Select value={formData.jenis_kost} onValueChange={(v) => handleChange("jenis_kost", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Jenis Kost" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Putra">Putra</SelectItem>
                    <SelectItem value="Putri">Putri</SelectItem>
                    <SelectItem value="Campur">Campur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Luas Tanah (m²)</Label><Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} /></div>
              <div><Label>Luas Bangunan (m²)</Label><Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} /></div>
              <div><Label>Lebar Depan (m)</Label><Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} /></div>
              <div><Label>Jumlah Lantai</Label><Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Tidur</Label><Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} placeholder="Jumlah kamar" /></div>
              <div><Label>Jumlah Kamar Mandi</Label><Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} placeholder="Jumlah kamar mandi" /></div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="ruang_penjaga" checked={formData.ruang_penjaga} onCheckedChange={(c) => handleChange("ruang_penjaga", c)} />
                <Label htmlFor="ruang_penjaga">Ruang Penjaga</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="token_listrik_perkamar" checked={formData.token_listrik_perkamar} onCheckedChange={(c) => handleChange("token_listrik_perkamar", c)} />
                <Label htmlFor="token_listrik_perkamar">Token Listrik Sudah perkamar?</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga Sewa Kamar Per Bulan (Rp)</Label>
                <Input value={formData.harga_sewa_kamar} onChange={(e) => handlePriceChange("harga_sewa_kamar", e.target.value)} placeholder="500000" />
              </div>
              <div>
                <Label>Biaya Pengeluaran Per Bulan (Rp)</Label>
                <Input value={formData.biaya_pengeluaran_per_bulan} onChange={(e) => handlePriceChange("biaya_pengeluaran_per_bulan", e.target.value)} placeholder="1000000" />
              </div>
            </div>
            <div>
              <Label>Kelengkapan</Label>
              <Select value={formData.kelengkapan} onValueChange={(v) => handleChange("kelengkapan", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih Kelengkapan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                  <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                  <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "hotel":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Jenis Hotel <span className="text-red-500">*</span></Label>
                <Select value={formData.jenis_hotel} onValueChange={(v) => handleChange("jenis_hotel", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Jenis Hotel" /></SelectTrigger>
                  <SelectContent>
                    {JENIS_HOTEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Luas Tanah (m²)</Label><Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} /></div>
              <div><Label>Luas Bangunan (m²)</Label><Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} /></div>
              <div><Label>Lebar Depan (m)</Label><Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} /></div>
              <div><Label>Jumlah Lantai</Label><Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Tidur</Label><Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} placeholder="Jumlah kamar" /></div>
              <div><Label>Jumlah Kamar Mandi</Label><Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} placeholder="Jumlah kamar mandi" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga Sewa Kamar Per Bulan (Rp)</Label>
                <Input value={formData.harga_sewa_kamar} onChange={(e) => handlePriceChange("harga_sewa_kamar", e.target.value)} />
              </div>
              <div>
                <Label>Income Rata-Rata Per Bulan (Rp)</Label>
                <Input value={formData.income_per_bulan} onChange={(e) => handlePriceChange("income_per_bulan", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Biaya Pengeluaran Per Bulan (Rp)</Label>
              <Input value={formData.biaya_pengeluaran_per_bulan} onChange={(e) => handlePriceChange("biaya_pengeluaran_per_bulan", e.target.value)} />
            </div>
            <div>
              <Label>Kelengkapan</Label>
              <Select value={formData.kelengkapan} onValueChange={(v) => handleChange("kelengkapan", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih Kelengkapan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                  <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                  <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "homestay":
      case "villa":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><Label>Luas Tanah (m²)</Label><Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} /></div>
              <div><Label>Luas Bangunan (m²)</Label><Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} /></div>
              <div><Label>Lebar Depan (m)</Label><Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} /></div>
              <div><Label>Jumlah Lantai</Label><Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Tidur</Label><Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Mandi</Label><Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga Sewa Kamar Per Bulan (Rp)</Label>
                <Input value={formData.harga_sewa_kamar} onChange={(e) => handlePriceChange("harga_sewa_kamar", e.target.value)} />
              </div>
              <div>
                <Label>Income Rata-Rata Per Bulan (Rp)</Label>
                <Input value={formData.income_per_bulan} onChange={(e) => handlePriceChange("income_per_bulan", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Biaya Pengeluaran Per Bulan (Rp)</Label>
              <Input value={formData.biaya_pengeluaran_per_bulan} onChange={(e) => handlePriceChange("biaya_pengeluaran_per_bulan", e.target.value)} />
            </div>
            <div>
              <Label>Kelengkapan</Label>
              <Select value={formData.kelengkapan} onValueChange={(v) => handleChange("kelengkapan", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih Kelengkapan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                  <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                  <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "apartment":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Luas Bangunan (m²) <span className="text-red-500">*</span></Label>
                <Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} />
              </div>
              <div>
                <Label>Lantai</Label>
                <Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} />
              </div>
              <div>
                <Label>No. Unit</Label>
                <Input value={formData.no_unit} onChange={(e) => handleChange("no_unit", e.target.value)} placeholder="Unit 101" />
              </div>
              <div>
                <Label>Jumlah Kamar Tidur</Label>
                <Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} />
              </div>
              <div>
                <Label>Jumlah Kamar Mandi</Label>
                <Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Kelengkapan</Label>
              <Select value={formData.kelengkapan} onValueChange={(v) => handleChange("kelengkapan", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih Kelengkapan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                  <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                  <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "gudang":
      case "komersial":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Luas Tanah (m²) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} />
            </div>
            <div>
              <Label>Luas Bangunan (m²)</Label>
              <Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* KODE LISTING - Auto Generate */}
      <div className="space-y-2">
        <Label>Kode Listing</Label>
        <div className="flex gap-2">
          <Input
            value={formData.kode_listing}
            onChange={(e) => handleChange("kode_listing", e.target.value)}
            placeholder="SBP-XXXXXX-XXXX"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={generateRandomKode}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      {/* JENIS PROPERTI */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Jenis Properti <span className="text-red-500">*</span></Label>
        <div className="flex flex-wrap gap-3">
          {PROPERTY_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all select-none ${
                formData.jenis_properti === type.value 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="jenis_properti"
                value={type.value}
                checked={formData.jenis_properti === type.value}
                onChange={(e) => {
                  handleChange("jenis_properti", e.target.value);
                }}
                className="h-5 w-5 text-primary accent-primary cursor-pointer relative z-10"
              />
              <span className="text-sm font-medium cursor-pointer">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* JUDUL PROPERTI */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Judul Properti</Label>
        <Input
          value={formData.judul_properti}
          onChange={(e) => handleChange("judul_properti", e.target.value)}
          placeholder="Contoh: Rumah Mewah Full Furnished di Jl. Kaliurang"
        />
        <p className="text-xs text-gray-500">Judul akan ditampilkan di listing dan membantu user menemukan properti Anda</p>
      </div>

      {/* TUJUAN TRANSAKSI - Updated: Checkbox for multiple selection */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Tujuan Transaksi</Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="status_dijual" 
              checked={formData.status_dijual} 
              onCheckedChange={(c) => handleChange("status_dijual", c)} 
            />
            <Label htmlFor="status_dijual" className="cursor-pointer font-medium">Dijual</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="status_disewakan" 
              checked={formData.status_disewakan} 
              onCheckedChange={(c) => handleChange("status_disewakan", c)} 
            />
            <Label htmlFor="status_disewakan" className="cursor-pointer font-medium">Disewakan</Label>
          </div>
        </div>
      </div>

      {/* HARGA - Updated: Show both prices if both selected */}
      <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold">Harga</h3>
        
        {formData.status_dijual && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Harga Penawaran (Rp)</Label>
              <Input
                value={formData.harga_properti}
                onChange={(e) => handlePriceChange("harga_properti", e.target.value)}
                placeholder="500000000"
              />
            </div>
            <div className="flex flex-col gap-2 pt-6">
              <div className="flex items-center gap-2">
                <Checkbox id="harga_nego" checked={formData.harga_nego} onCheckedChange={(c) => handleChange("harga_nego", c)} />
                <Label htmlFor="harga_nego">Nego</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="harga_nett" checked={formData.harga_nett} onCheckedChange={(c) => handleChange("harga_nett", c)} />
                <Label htmlFor="harga_nett">Nett</Label>
              </div>
            </div>
          </div>
        )}
        
        {formData.status_disewakan && (
          <div>
            <Label>Harga Sewa / Tahun (Rp)</Label>
            <Input 
              value={formData.harga_sewa_tahunan} 
              onChange={(e) => handlePriceChange("harga_sewa_tahunan", e.target.value)} 
              placeholder="60000000" 
            />
          </div>
        )}
      </div>

      {/* DYNAMIC FIELDS BASED ON PROPERTY TYPE */}
      {formData.jenis_properti && (
        <div className="border-t pt-6 space-y-4">
          <h3 className="font-semibold">Detail Properti</h3>
          {renderDynamicFields()}
        </div>
      )}

      {/* ALAMAT */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">Lokasi Properti</h3>
        
        {/* Provinsi & Kabupaten - Required */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Provinsi <span className="text-red-500">*</span></Label>
            <Input
              value={formData.provinsi}
              onChange={(e) => handleChange("provinsi", e.target.value)}
              placeholder="DIY Yogyakarta"
              required
            />
          </div>
          <div>
            <Label>Kabupaten/Kota <span className="text-red-500">*</span></Label>
            <Input
              value={formData.kabupaten}
              onChange={(e) => handleChange("kabupaten", e.target.value)}
              placeholder="Sleman"
              required
            />
          </div>
        </div>
        
        {/* Kecamatan & Kelurahan */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Kecamatan</Label>
            <Input
              value={formData.kecamatan || ""}
              onChange={(e) => handleChange("kecamatan", e.target.value)}
              placeholder="Depok"
            />
          </div>
          <div>
            <Label>Kelurahan</Label>
            <Input
              value={formData.kelurahan || ""}
              onChange={(e) => handleChange("kelurahan", e.target.value)}
              placeholder="Caturtunggal"
            />
          </div>
        </div>
        
        {/* Alamat Lengkap */}
        <div>
          <Label>Alamat Lengkap</Label>
          <Textarea 
            value={formData.alamat_lengkap} 
            onChange={(e) => handleChange("alamat_lengkap", e.target.value)} 
            rows={3} 
            placeholder="Jl. Nama Jalan, Nomor Rumah" 
          />
        </div>
        
        {/* Google Maps - Admin Only */}
        {sourceInput === 'ADMIN' && (
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowGoogleMaps(!showGoogleMaps)}>
              {showGoogleMaps ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showGoogleMaps ? 'Sembunyikan' : 'Tampilkan'} Google Maps
            </Button>
            <span className="text-xs text-gray-500">(Admin only - tidak tampil di homepage)</span>
          </div>
        )}
        {showGoogleMaps && (
          <div>
            <Label>Link Google Maps</Label>
            <Input 
              value={formData.google_maps_link} 
              onChange={(e) => handleChange("google_maps_link", e.target.value)} 
              placeholder="https://maps.google.com/..." 
            />
          </div>
        )}
      </div>

      {/* LEGALITAS */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">Legalitas</h3>
        <div>
          <Label>Status Legalitas</Label>
          <Select value={formData.legalitas} onValueChange={(v) => handleChange("legalitas", v)}>
            <SelectTrigger><SelectValue placeholder="Pilih Legalitas" /></SelectTrigger>
            <SelectContent>
              {LEGALITAS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* SHGB Expiry Date */}
        {formData.legalitas?.includes('SHGB') && (
          <div>
            <Label>SHGB Berlaku Sampai</Label>
            <Input 
              type="date" 
              value={formData.shgb_expired_at} 
              onChange={(e) => handleChange("shgb_expired_at", e.target.value)} 
            />
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="status_legalitas_hand" checked={formData.status_legalitas === "On Hand"} onCheckedChange={() => handleChange("status_legalitas", "On Hand")} />
            <Label htmlFor="status_legalitas_hand">On Hand</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="status_legalitas_bank" checked={formData.status_legalitas === "On Bank"} onCheckedChange={() => handleChange("status_legalitas", "On Bank")} />
            <Label htmlFor="status_legalitas_bank">On Bank</Label>
          </div>
        </div>
        {formData.status_legalitas === "On Bank" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Diagunkan di Bank?</Label>
              <Input value={formData.bank_terkait} onChange={(e) => handleChange("bank_terkait", e.target.value)} placeholder="Nama Bank" />
            </div>
            <div>
              <Label>Berapa Outstanding Properti Di Bank? (Rp)</Label>
              <Input value={formData.outstanding_bank} onChange={(e) => handlePriceChange("outstanding_bank", e.target.value)} placeholder="500000000" />
            </div>
          </div>
        )}
      </div>

      {/* KONDISI LINGKUNGAN */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">Apakah Properti Jauh Makam / Sungai / Sutet?</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox id="dekat_sungai" checked={formData.dekat_sungai} onCheckedChange={(c) => handleChange("dekat_sungai", c)} />
            <Label htmlFor="dekat_sungai" className="cursor-pointer">Dekat Sungai</Label>
            {formData.dekat_sungai && (
              <div className="flex items-center gap-2 ml-4">
                <Label>Jarak:</Label>
                <Input 
                  type="number" 
                  className="w-24" 
                  value={formData.jarak_sungai} 
                  onChange={(e) => handleChange("jarak_sungai", e.target.value)} 
                  placeholder="m" 
                />
                <Label>m</Label>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="dekat_makam" checked={formData.dekat_makam} onCheckedChange={(c) => handleChange("dekat_makam", c)} />
            <Label htmlFor="dekat_makam" className="cursor-pointer">Dekat Makam</Label>
            {formData.dekat_makam && (
              <div className="flex items-center gap-2 ml-4">
                <Label>Jarak:</Label>
                <Input 
                  type="number" 
                  className="w-24" 
                  value={formData.jarak_makam} 
                  onChange={(e) => handleChange("jarak_makam", e.target.value)} 
                  placeholder="m" 
                />
                <Label>m</Label>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="dekat_sutet" checked={formData.dekat_sutet} onCheckedChange={(c) => handleChange("dekat_sutet", c)} />
            <Label htmlFor="dekat_sutet" className="cursor-pointer">Dekat Sutet</Label>
            {formData.dekat_sutet && (
              <div className="flex items-center gap-2 ml-4">
                <Label>Jarak:</Label>
                <Input 
                  type="number" 
                  className="w-24" 
                  value={formData.jarak_sutet} 
                  onChange={(e) => handleChange("jarak_sutet", e.target.value)} 
                  placeholder="m" 
                />
                <Label>m</Label>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-32">Lebar Jalan:</Label>
            <Input 
              type="number" 
              className="w-24" 
              value={formData.lebar_jalan} 
              onChange={(e) => handleChange("lebar_jalan", e.target.value)} 
              placeholder="meter" 
            />
            <Label>meter</Label>
          </div>
        </div>
      </div>

      {/* INFORMASI TAMBAHAN */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">Informasi Tambahan Terkait Detail Properti & Fasilitas</h3>
        
        <div>
          <Label>Jelaskan Secara Lengkap Dan Detail Perihal Properti</Label>
          <Textarea 
            value={formData.deskripsi} 
            onChange={(e) => handleChange("deskripsi", e.target.value)} 
            rows={4} 
            placeholder="Jelaskan secara lengkap tentang properti..." 
          />
        </div>
        
        <div>
          <Label>Alasan Dijual Kenapa?</Label>
          <Textarea 
            value={formData.alasan_dijual} 
            onChange={(e) => handleChange("alasan_dijual", e.target.value)} 
            rows={2} 
            placeholder="Mengapa properti ini dijual..." 
          />
        </div>
        
        {/* LABELS - Checkbox options - ADMIN ONLY */}
        {sourceInput === 'ADMIN' && (
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Label Properti</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_premium" 
                  checked={formData.is_premium} 
                  onCheckedChange={(c) => handleChange("is_premium", c)} 
                />
                <Label htmlFor="is_premium" className="cursor-pointer font-medium">Premium</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_featured" 
                  checked={formData.is_featured} 
                  onCheckedChange={(c) => handleChange("is_featured", c)} 
                />
                <Label htmlFor="is_featured" className="cursor-pointer font-medium">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_hot" 
                  checked={formData.is_hot} 
                  onCheckedChange={(c) => handleChange("is_hot", c)} 
                />
                <Label htmlFor="is_hot" className="cursor-pointer font-medium">Hot</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_sold" 
                  checked={formData.is_sold} 
                  onCheckedChange={(c) => handleChange("is_sold", c)} 
                />
                <Label htmlFor="is_sold" className="cursor-pointer font-medium text-red-600">SOLD</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_property_pilihan" 
                  checked={formData.is_property_pilihan} 
                  onCheckedChange={(c) => handleChange("is_property_pilihan", c)} 
                />
                <Label htmlFor="is_property_pilihan" className="cursor-pointer font-medium">Properti Pilihan</Label>
              </div>
            </div>
          </div>
        )}
        
        {/* Image Upload with Auto WebP Conversion */}
        <div>
          <Label>Upload Foto Properti</Label>
          <MultiImageDropzone
            initialImages={[
              formData.image_url,
              formData.image_url1,
              formData.image_url2,
              formData.image_url3,
              formData.image_url4,
              formData.image_url5,
              formData.image_url6,
              formData.image_url7,
              formData.image_url8,
              formData.image_url9,
            ].filter(Boolean)}
            onImagesChange={(urls: string[]) => {
              // Update form data with image URLs
              handleChange('image_url', urls[0] || '');
              handleChange('image_url1', urls[1] || '');
              handleChange('image_url2', urls[2] || '');
              handleChange('image_url3', urls[3] || '');
              handleChange('image_url4', urls[4] || '');
              handleChange('image_url5', urls[5] || '');
              handleChange('image_url6', urls[6] || '');
              handleChange('image_url7', urls[7] || '');
              handleChange('image_url8', urls[8] || '');
              handleChange('image_url9', urls[9] || '');
            }}
            propertyId={property?.id}
            maxImages={10}
          />
          <p className="text-xs text-gray-500 mt-1">Auto konversi ke WebP saat upload</p>
        </div>
      </div>

      {/* SUBMIT */}
      <div className="flex flex-wrap justify-end pt-4 border-t gap-3">
        <Button type="button" variant="outline" onClick={handleResetForm}>
          <Trash2 className="h-4 w-4 mr-2" />
          Reset Form
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Batal
        </Button>
        
        {/* Show after successful submit - Option to add another property */}
        {showAddAnother ? (
          <>
            <Button 
              type="button" 
              variant="default"
              onClick={handleAddAnotherProperty}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Properti Lain
            </Button>
            <Button 
              type="button" 
              variant="default"
              onClick={() => setShowAgreementPreview(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Preview & Tanda Tangan Perjanjian
            </Button>
          </>
        ) : (
          <Button type="submit" disabled={isSubmitting} className="min-w-40">
            {isSubmitting ? "Menyimpan..." : "Simpan Properti"}
          </Button>
        )}
        
        {/* Show after submitting multiple properties */}
        {submittedProperties.length > 0 && !showAddAnother && (
          <div className="w-full mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              ✓ {submittedProperties.length} properti telah disimpan dalam perjanjian ini
            </p>
          </div>
        )}
      </div>

      {/* Agreement Preview Modal */}
      <Dialog open={showAgreementPreview} onOpenChange={setShowAgreementPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">
              PERJANJIAN JASA PEMASARAN
              <br />
              SALAM BUMI PROPERTY
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-sm" ref={agreementPreviewRef}>
            {/* Agreement Type */}
            <div className="text-center font-semibold mb-4">
              {agreementData?.agreement_type === 'exclusive_booster' 
                ? `( EXCLUSIVE BOOSTER – KONTRAK ${agreementData?.exclusive_booster_duration_months || 6} BULAN )`
                : '( OPEN LISTING – PEMASARAN BEBAS )'}
            </div>

            {/* Agreement Number */}
            <div className="text-center mb-4">
              <p>Nomor: {formData.kode_listing || 'AUTO-GENERATE'}</p>
            </div>

            {/* Date */}
            <div className="text-center mb-4">
              <p>Pada hari ini, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, telah dibuat dan disepakati Perjanjian Jasa Pemasaran Properti antara:</p>
            </div>

            {/* First Party - Salam Bumi Property */}
            <div className="border p-3 rounded">
              <p className="font-semibold">PIHAK PERTAMA</p>
              <div className="mt-2 text-xs space-y-1">
                <p><strong>Nama Perusahaan :</strong> CV Salam Bumi Property</p>
                <p><strong>Alamat Kantor :</strong> Jl Pajajaran, Catur Tunggal, Depok, Sleman (Sekarang Menggunakan Virtual Office)</p>
                <p><strong>Telp / WhatsApp :</strong> 0813-9127-8889</p>
                <p><strong>Email :</strong> salambumiproperty@gmail.com</p>
                <p><strong>Website :</strong> salambumi.xyz</p>
              </div>
              <p className="mt-2 text-xs">Dalam hal ini bertindak sebagai Penyedia Jasa Pemasaran Properti, selanjutnya disebut PIHAK PERTAMA.</p>
            </div>

            {/* Second Party - Owner */}
            <div className="border p-3 rounded">
              <p className="font-semibold">PIHAK KEDUA</p>
              <div className="mt-2 text-xs space-y-1">
                <p><strong>Nama :</strong> {ownerData?.nama_lengkap || '[Nama Pemilik]'}</p>
                <p><strong>No. KTP :</strong> {ownerData?.no_ktp || '[No. KTP]'}</p>
                <p><strong>Alamat KTP :</strong> {ownerData?.alamat_ktp || '[Alamat KTP]'}</p>
              </div>
              <p className="mt-2 text-xs">Dalam hal ini bertindak sebagai Pemilik Properti, selanjutnya disebut PIHAK KEDUA.</p>
              <p className="mt-1 text-xs">PIHAK PERTAMA dan PIHAK KEDUA selanjutnya secara bersama-sama disebut para Pihak.</p>
            </div>

            {/* Pasal 1 - Object Agreement */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL 1</p>
              <p className="font-semibold">OBJEK PERJANJIAN</p>
              <p className="mt-1 text-xs">PIHAK KEDUA memberikan hak pemasaran secara {agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE' : 'BEBAS / TIDAK TERIKAT'} kepada PIHAK PERTAMA untuk memasarkan properti milik PIHAK KEDUA dengan data sebagai berikut:</p>
              
              <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                <p className="font-semibold">Objek Properti</p>
                <p><strong>Jenis Properti :</strong> {formData.jenis_properti || '-'}</p>
                <p><strong>Sertifikat :</strong> {formData.legalitas || '-'}</p>
                <p><strong>Alamat :</strong> {formData.alamat_lengkap || `${formData.kelurahan || ''}, ${formData.kecamatan || ''}, ${formData.kabupaten || ''}, ${formData.provinsi || ''}`}</p>
                <p><strong>Harga Penawaran :</strong> {formData.harga_properti ? `Rp ${parseInt(formData.harga_properti).toLocaleString('id-ID')}` : '-'} {formData.harga_nego ? 'Nego' : ''} {formData.harga_nett ? 'Nett' : ''}</p>
              </div>
            </div>

            {/* Pasal 2 - Listing Type and Contract Duration */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL 2</p>
              <p className="font-semibold">JENIS LISTING DAN MASA KONTRAK</p>
              <div className="mt-1 text-xs space-y-1">
                <p>Jenis listing yang disepakati adalah {agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE LISTING' : 'OPEN LISTING'}.</p>
                {agreementData?.agreement_type === 'exclusive_booster' && (
                  <p>Masa kontrak berlaku selama {agreementData?.exclusive_booster_duration_months || 6} ({agreementData?.exclusive_booster_duration_months || 6}) bulan, terhitung sejak tanggal ditandatanganinya perjanjian ini.</p>
                )}
                {agreementData?.agreement_type === 'exclusive_booster' && (
                  <p>Selama masa kontrak berlangsung, PIHAK KEDUA tidak diperkenankan menunjuk agen properti lain untuk memasarkan objek properti sebagaimana dimaksud dalam Pasal 1.</p>
                )}
                {agreementData?.agreement_type !== 'exclusive_booster' && (
                  <p>PIHAK KEDUA boleh dan bebas memasarkan propertinya sendiri atau melalui Agent / Perantara Lain selain kepada PIHAK PERTAMA.</p>
                )}
                {agreementData?.agreement_type !== 'exclusive_booster' && (
                  <p>Apabila properti terjual oleh calon pembeli dari PIHAK PERTAMA, maka PIHAK KEDUA wajib membayarkan fee 3% dari harga deal penjualan kepada pihak pertama.</p>
                )}
              </div>
            </div>

            {/* Pasal 3 - Fee/Commission */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL 3</p>
              <p className="font-semibold">KETENTUAN FEE / KOMISI</p>
              <div className="mt-1 text-xs space-y-1">
                <p>PIHAK KEDUA menyetujui membayar fee atau komisi sebesar 3% (tiga persen) dari harga deal PENJUALAN kepada PIHAK PERTAMA jika PIHAK PERTAMA berhasil menjualkan properti milik PIHAK KEDUA.</p>
                <p>Pembayaran fee dilakukan selambat-lambatnya 3 (tiga) hari setelah:</p>
                <ul className="list-disc pl-4">
                  <li>Akta Jual Beli (AJB) ditandatangani, atau</li>
                  <li>Apabila transaksi dilakukan secara tunai bertahap, maka pembayaran fee dilakukan setelah pembayaran mencapai minimal 30% (Down Payment) dari total harga.</li>
                </ul>
              </div>
            </div>

            {/* Pasal 4 - Marketing and Costs (Only for Exclusive Booster) */}
            {agreementData?.agreement_type === 'exclusive_booster' && (
              <div className="border-t pt-3">
                <p className="font-semibold">4. JENIS PEMASARAN</p>
                <ul className="text-xs list-disc pl-4 mt-1">
                  {agreementData?.meta_ads_enabled && <li>Meta Ads (Instagram & Facebook)</li>}
                  {agreementData?.tiktok_ads_enabled && <li>TikTok Ads</li>}
                  <li>Penargetan berdasarkan usia, buying power, lokasi, demografi, minat, dan perilaku</li>
                </ul>
                
                <p className="font-semibold mt-2">5. BIAYA PEMASARAN</p>
                <ul className="text-xs list-disc pl-4 mt-1">
                  <li>Biaya Admin: Rp 1.500.000 (dibayar di awal/fixed)</li>
                  <li>Biaya Ads: Dimulai dari Rp 50.000/hari</li>
                </ul>
              </div>
            )}

            {/* Pasal 4 - Cancellation (for Open Listing) */}
            {agreementData?.agreement_type !== 'exclusive_booster' && (
              <div className="border-t pt-3">
                <p className="font-semibold">PASAL 4</p>
                <p className="font-semibold">PEMBATALAN TRANSAKSI</p>
                <div className="mt-1 text-xs">
                  <p>Apabila terjadi pembatalan sepihak oleh calon pembeli, maka PIHAK KEDUA menyetujui memberikan 50% (lima puluh persen) dari booking fee / tanda jadi kepada PIHAK PERTAMA.</p>
                  <p>Ketentuan ini berlaku sepanjang pembatalan bukan disebabkan oleh kesalahan PIHAK PERTAMA.</p>
                </div>
              </div>
            )}

            {/* Pasal 5 - Obligations */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL 5</p>
              <p className="font-semibold">KEWAJIBAN PIHAK PERTAMA</p>
              <ul className="text-xs list-disc pl-4 mt-1">
                <li>Melakukan pemasaran properti secara profesional dan maksimal</li>
                <li>Menyusun strategi pemasaran sesuai standar Salam Bumi Property</li>
                <li>Memberikan laporan pemasaran secara berkala kepada PIHAK KEDUA</li>
              </ul>
              
              <p className="font-semibold mt-2">KEWAJIBAN PIHAK KEDUA</p>
              <ul className="text-xs list-disc pl-4 mt-1">
                <li>Menyediakan data dan dokumen legalitas properti yang benar dan sah</li>
                <li>Memberikan akses yang diperlukan untuk kepentingan pemasaran</li>
                <li>Membayar fee sesuai ketentuan perjanjian ini</li>
              </ul>
            </div>

            {/* Pasal 6 - Dispute Resolution */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL 6</p>
              <p className="font-semibold">PENYELESAIAN SENGKETA</p>
              <div className="mt-1 text-xs">
                <p>Apabila terjadi perselisihan, para Pihak sepakat menyelesaikannya terlebih dahulu secara musyawarah untuk mufakat.</p>
                <p>Apabila tidak tercapai, diselesaikan melalui jalur hukum di wilayah hukum setempat.</p>
              </div>
            </div>

            {/* Pasal 7 - Miscellaneous */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL 7</p>
              <p className="font-semibold">LAIN-LAIN</p>
              <div className="mt-1 text-xs space-y-1">
                <li>Perjanjian ini mulai berlaku sejak ditandatangani oleh Para Pihak</li>
                <li>Perubahan atau penambahan hanya sah apabila dibuat secara tertulis dan disepakati oleh Para Pihak</li>
                <li>Perjanjian ini dibuat dalam 2 (dua) rangkap, masing-masing mempunyai kekuatan hukum yang sama</li>
              </div>
            </div>

            {/* Signature Area */}
            <div className="border-t pt-4 mt-4">
              <p className="text-center mb-4">
                Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              {/* ROW ATAS - FINAL LEGAL VIEW */}
              <div className="final-signature-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                {/* OWNER SECTION */}
                <div className="owner-section" style={{ width: '45%', textAlign: 'center', margin: 0, padding: 0 }}>
                  <h3 className="font-medium" style={{ margin: 0, padding: 0, lineHeight: 1.2, height: '24px' }}>Yang Memberi Persetujuan</h3>
                  
                  <div className="owner-stamp-wrapper" style={{ position: 'relative', width: '250px', height: '160px', margin: '8px auto 0 auto' }}>
                    {/* Materai - Larger size */}
                    <img 
                      src="https://images.salambumi.xyz/materai/hg.png" 
                      alt="Materai" 
                      className="materai"
                      style={{ 
                        position: 'absolute', 
                        width: '140px', 
                        bottom: '0', 
                        left: '0',
                        top: 'auto',
                        right: 'auto'
                      }}
                    />
                    
                    {/* Owner Final Signature - Overlapping materai */}
                    {ownerSignature && (
                      <img 
                        id="ownerFinalTtd"
                        src={ownerSignature}
                        alt="Tanda Tangan"
                        className="owner-overlay"
                        style={{ 
                          position: 'absolute',
                          width: '170px',
                          bottom: '15px',
                          left: '35px',
                          top: 'auto',
                          right: 'auto',
                          zIndex: 5,
                          background: 'transparent',
                          mixBlendMode: 'multiply'
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="owner-name" style={{ marginTop: '8px', height: '24px' }}>
                    <p style={{ 
                      borderTop: '2px solid #1F2937', 
                      paddingTop: '8px',
                      margin: '0 20px',
                      display: 'inline-block',
                      lineHeight: 1.2
                    }}>
                      <span className="font-semibold">( {ownerData?.nama_lengkap || '[Nama Pemilik]'} )</span>
                    </p>
                  </div>
                </div>
                
                {/* AGENT SECTION */}
                <div className="agent-section" style={{ width: '45%', textAlign: 'center', margin: 0, padding: 0 }}>
                  <h3 className="font-medium" style={{ margin: 0, padding: 0, lineHeight: 1.2, height: '24px' }}>Agent Pemasaran</h3>
                  
                  {/* Agent TTD Container - Same dimensions as owner-stamp-wrapper */}
                  <div style={{ position: 'relative', width: '250px', height: '160px', margin: '8px auto 0 auto' }}>
                    <img 
                      src="https://images.salambumi.xyz/materai/gsd-removebg-preview%20-%20Copy.png" 
                      alt="Tanda Tangan Agent"
                      style={{ 
                        width: '200px',
                        position: 'absolute',
                        bottom: '10px',
                        left: '25px'
                      }}
                    />
                  </div>
                  
                  <div className="agent-name" style={{ marginTop: '8px', height: '24px' }}>
                    <p style={{ 
                      borderTop: '2px solid #1F2937', 
                      paddingTop: '8px',
                      margin: '0 20px',
                      display: 'inline-block',
                      lineHeight: 1.2
                    }}>
                      <span className="font-semibold">( ARDY SALAM )</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1">Salam Bumi Property</p>
                  </div>
                </div>
              </div>
              
              {/* ROW BAWAH - INPUT ONLY */}
              <div className="signature-input-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 className="text-lg font-medium mb-2 mt-0" style={{ marginTop: 0 }}>Tanda Tangan Digital</h2>
                
                {/* Canvas for drawing - NOT inside owner-section */}
                <canvas 
                  ref={signatureCanvasRef}
                  id="ownerCanvas"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair"
                  style={{ 
                    width: '600px',
                    height: '250px',
                    border: '3px solid black',
                    touchAction: 'none'
                  }}
                />
                
                {!ownerSignature && (
                  <p className="text-gray-400 text-sm mt-2">Gambar tanda tangan di atas</p>
                )}
                
                {/* Action buttons */}
                <div className="flex gap-3 mt-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm"
                    onClick={clearSignature}
                    className="text-red-500 border-red-500 hover:bg-red-50"
                  >
                    ✕ Hapus
                  </Button>
                  <Button 
                    type="button" 
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (signatureCanvasRef.current) {
                        const dataURL = signatureCanvasRef.current.toDataURL('image/png');
                        setOwnerSignature(dataURL);
                        toast({
                          title: "Tanda Tangan Disimpan",
                          description: "Tanda tangan berhasil disimpan!",
                          duration: 3000
                        });
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    💾 Simpan Tanda Tangan
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-yellow-50 p-3 rounded text-xs mt-4">
              <p className="font-semibold">Catatan:</p>
              <ul className="list-disc pl-4 mt-1">
                <li>Tanda tangan ini sah secara hukum</li>
                <li>Pembayaran fee dilakukan setelah AJB ditandatangani</li>
                <li>50% dari booking fee akan diberikan ke agen jika pembatalan bukan caused by agent</li>
              </ul>
            </div>

            {/* Digital Signature Section */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-2">Tanda Tangan Digital</h4>
              <p className="text-xs text-gray-500 mb-2">
                Gambar tanda tangan Anda di atas, lalu klik "Simpan Tanda Tangan" untuk menyimpan
              </p>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    if (signatureCanvasRef.current) {
                      // Convert canvas to PNG base64
                      const dataURL = signatureCanvasRef.current.toDataURL("image/png");
                      setOwnerSignature(dataURL);
                      setAgreementAccepted(true);
                      toast({
                        title: "Tanda Tangan Disimpan",
                        description: "Tanda tangan berhasil disimpan dalam format PNG",
                        duration: 3000
                      });
                    }
                  }}
                >
                  Simpan Tanda Tangan
                </Button>
                {ownerSignature && (
                  <p className="text-green-600 text-sm flex items-center">
                    ✓ Tanda tangan tersimpan
                  </p>
                )}
              </div>
            </div>

            {/* Agreement Checkbox - Requires signature first */}
            <div className="flex items-start gap-2 mt-4">
              <Checkbox 
                id="agreement_accepted" 
                checked={agreementAccepted} 
                onCheckedChange={(checked) => {
                  // Only allow checking if signature exists
                  if (checked && !ownerSignature) {
                    toast({
                      title: "Tanda Tangan Diperlukan",
                      description: "Silakan gambar dan simpan tanda tangan terlebih dahulu",
                      variant: "destructive",
                      duration: 3000
                    });
                    return;
                  }
                  setAgreementAccepted(checked as boolean);
                }}
              />
              <Label htmlFor="agreement_accepted" className="text-sm cursor-pointer">
                Saya setuju dengan syarat dan ketentuan yang berlaku. Dengan mencentang ini, Anda menyatakan bahwa semua informasi yang diberikan adalah benar dan menyetujui perjanjian marketing dengan Salam Bumi Property.
              </Label>
            </div>
          </div>

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowAgreementPreview(false)}>
              Tutup
            </Button>
            {ownerSignature && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => downloadAgreementImage('webp')}
                  disabled={isCapturing}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download WebP
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => downloadAgreementImage('png')}
                  disabled={isCapturing}
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
                <Button 
                  variant="outline"
                  onClick={generatePDF}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </>
            )}
            <Button 
              variant="default"
              disabled={!agreementAccepted || !ownerSignature || isCapturing}
              onClick={async () => {
                // Capture and save agreement preview to Supabase
                try {
                  const savedUrl = await captureAgreementPreview();
                  
                  // Call onSuccess with goToComplete=true to proceed to complete step
                  if (onSuccess) {
                    const lastPropertyId = submittedProperties.length > 0 
                      ? submittedProperties[submittedProperties.length - 1] 
                      : '';
                    onSuccess(lastPropertyId || '', true);
                  }
                  
                  toast({
                    title: "Perjanjian Disetujui",
                    description: savedUrl ? "Perjanjian marketing telah disimpan dengan preview gambar" : "Perjanjian marketing telah disetujui",
                    duration: 5000
                  });
                  setShowAgreementPreview(false);
                  // Reset form after agreement
                  handleResetForm();
                } catch (error) {
                  console.error('Error saving agreement:', error);
                  toast({
                    title: "Error",
                    description: "Gagal menyimpan preview perjanjian, tetapi perjanjian tetap disimpan",
                    variant: "destructive",
                    duration: 5000
                  });
                  // Still proceed even if capture fails
                  if (onSuccess) {
                    const lastPropertyId = submittedProperties.length > 0 
                      ? submittedProperties[submittedProperties.length - 1] 
                      : '';
                    onSuccess(lastPropertyId || '', true);
                  }
                  setShowAgreementPreview(false);
                  handleResetForm();
                }
              }}
            >
              {isCapturing ? "Menyimpan..." : "Setuju & Selesai"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

export default ProductionPropertyForm;


