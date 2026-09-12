import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Building2,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Instagram,
  Globe,
  Upload,
  Camera,
  Eye,
  Star,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  Save,
  Plus,
  Compass,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Tag,
  Check,
  RotateCcw,
  Image as ImageIcon,
  CheckCheck
} from 'lucide-react';
import { Place, UserProfile, CategoryType, ProductItem, Company } from '../types';
import { CATEGORY_CONFIG, NEIGHBORHOODS } from '../data/initialPlaces';
import { NEIGHBORHOOD_COORDINATES } from '../data/neighborhoodCoordinates';
import { 
  updatePlaceInFirestore, 
  createPlaceInFirestore, 
  deletePlaceFromFirestore 
} from '../services/placesService';
import { updateUserProfile, loginWithGoogle } from '../services/authService';
import { uploadCompanyImage } from '../services/storageService';
import { saveCompanyToFirestore } from '../services/companiesService';
import { db, doc, setDoc, auth, sanitizeFirestoreData } from '../lib/firebase';

const cleanInitialImage = (url?: string | null): string => {
  if (!url) return '';
  if (typeof url === 'string' && url.includes('unsplash.com')) return '';
  return url;
};

const COMPANY_DRAFT_KEY = 'bairromap_company_reg_draft_v2';

const loadCompanyDraft = () => {
  try {
    const saved = localStorage.getItem(COMPANY_DRAFT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.regLogoUrl && parsed.regLogoUrl.includes('unsplash.com')) parsed.regLogoUrl = '';
      if (parsed.regImageUrl && parsed.regImageUrl.includes('unsplash.com')) parsed.regImageUrl = '';
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse company draft', e);
  }
  return null;
};

interface CompanyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  companyPlace: Place | null;
  onPlaceUpdated: (updatedPlace: Place) => void;
  onPlaceCreated?: (newPlace: Place) => void;
  onUserUpdated?: (updatedUser: UserProfile) => void;
  onStartPickingLocation?: () => void;
  onViewOnMap?: (place: Place) => void;
  onOpenCreatePlace?: () => void;
  onOpenRegisterModal?: () => void;
  pickedCoord?: { lat: number; lng: number } | null;
}

export const CompanyManagerModal: React.FC<CompanyManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  companyPlace,
  onPlaceUpdated,
  onPlaceCreated,
  onUserUpdated,
  onStartPickingLocation,
  onViewOnMap,
  onOpenCreatePlace,
  onOpenRegisterModal,
  pickedCoord,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'products' | 'location'>('products');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Form states for existing company - start clean without pre-ready unsplash images
  const [name, setName] = useState(companyPlace?.name || currentUser?.companyName || '');
  const [category, setCategory] = useState<CategoryType>(companyPlace?.category || 'restaurant');
  const [customCategory, setCustomCategory] = useState(companyPlace?.customCategory || '');
  const [subCategory, setSubCategory] = useState(companyPlace?.subCategory || 'Geral');
  const [address, setAddress] = useState(companyPlace?.address || '');
  const [neighborhood, setNeighborhood] = useState(companyPlace?.neighborhood || currentUser?.neighborhood || 'Curado IV');
  const [city, setCity] = useState(companyPlace?.city || 'Recife');
  const [phone, setPhone] = useState(companyPlace?.phone || currentUser?.phone || '');
  const [whatsapp, setWhatsapp] = useState(companyPlace?.whatsapp || '');
  const [hours, setHours] = useState(companyPlace?.hours || 'Seg a Sáb: 08:00 - 20:00');
  const [description, setDescription] = useState(companyPlace?.description || '');
  const [imageUrl, setImageUrl] = useState(cleanInitialImage(companyPlace?.imageUrl));
  const [logoUrl, setLogoUrl] = useState(cleanInitialImage(companyPlace?.logoUrl));
  const [instagram, setInstagram] = useState(companyPlace?.instagram || '');
  const [website, setWebsite] = useState(companyPlace?.website || '');
  const [isPaused, setIsPaused] = useState(Boolean(companyPlace?.isPaused));
  const [priceRange, setPriceRange] = useState<'$' | '$$' | '$$$' | '$$$$'>(companyPlace?.priceRange || '$$');
  const [placeLat, setPlaceLat] = useState<number>(
    typeof companyPlace?.lat === 'number' ? companyPlace.lat : parseFloat(String(companyPlace?.lat)) || -8.0645
  );
  const [placeLng, setPlaceLng] = useState<number>(
    typeof companyPlace?.lng === 'number' ? companyPlace.lng : parseFloat(String(companyPlace?.lng)) || -34.9855
  );
  const [hasChangedLocation, setHasChangedLocation] = useState<boolean>(false);

  // Products / Services list
  const [products, setProducts] = useState<ProductItem[]>(companyPlace?.productsOrServices || []);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');

  // Pre-saved registration draft initialization - clean without pre-ready unsplash images
  const initialDraft = loadCompanyDraft();
  const [regName, setRegName] = useState(initialDraft?.regName ?? (currentUser?.companyName || currentUser?.name || ''));
  const [regCategory, setRegCategory] = useState<CategoryType>(initialDraft?.regCategory ?? 'restaurant');
  const [regCustomCategory, setRegCustomCategory] = useState(initialDraft?.regCustomCategory ?? '');
  const [regSubCategory, setRegSubCategory] = useState(initialDraft?.regSubCategory ?? 'Alimentação & Lanches');
  const [regAddress, setRegAddress] = useState(initialDraft?.regAddress ?? '');
  const [regNeighborhood, setRegNeighborhood] = useState(initialDraft?.regNeighborhood ?? (currentUser?.neighborhood || 'Curado IV'));
  const [regCity, setRegCity] = useState(initialDraft?.regCity ?? 'Recife');
  const [regWhatsapp, setRegWhatsapp] = useState(initialDraft?.regWhatsapp ?? (currentUser?.phone || ''));
  const [regPhone, setRegPhone] = useState(initialDraft?.regPhone ?? '');
  const [regInstagram, setRegInstagram] = useState(initialDraft?.regInstagram ?? '');
  const [regHours, setRegHours] = useState(initialDraft?.regHours ?? 'Seg a Sáb: 08:00 às 20:00');
  const [regDescription, setRegDescription] = useState(initialDraft?.regDescription ?? 'Atendimento com excelência e qualidade no bairro!');
  const [regLogoUrl, setRegLogoUrl] = useState(cleanInitialImage(initialDraft?.regLogoUrl));
  const [regImageUrl, setRegImageUrl] = useState(cleanInitialImage(initialDraft?.regImageUrl));
  const [regLat, setRegLat] = useState<number>(initialDraft?.regLat ?? -8.0645);
  const [regLng, setRegLng] = useState<number>(initialDraft?.regLng ?? -34.9855);
  const [hasPickedCoord, setHasPickedCoord] = useState<boolean>(Boolean(initialDraft?.hasPickedCoord));
  const [regFirstProdName, setRegFirstProdName] = useState(initialDraft?.regFirstProdName ?? '');
  const [regFirstProdPrice, setRegFirstProdPrice] = useState(initialDraft?.regFirstProdPrice ?? '');
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  // Hidden file input refs for professional click-to-upload experience
  const regLogoFileInputRef = useRef<HTMLInputElement | null>(null);
  const regImageFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const prodFileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-save draft to localStorage whenever any registration field changes
  useEffect(() => {
    if (!companyPlace) {
      try {
        const draftData = {
          regName,
          regCategory,
          regCustomCategory,
          regSubCategory,
          regAddress,
          regNeighborhood,
          regCity,
          regWhatsapp,
          regPhone,
          regInstagram,
          regHours,
          regDescription,
          // Only store URL or lightweight base64 to avoid exceeding localStorage quota
          regLogoUrl: regLogoUrl.length < 300000 ? regLogoUrl : '',
          regImageUrl: regImageUrl.length < 300000 ? regImageUrl : '',
          regLat,
          regLng,
          hasPickedCoord,
          regFirstProdName,
          regFirstProdPrice,
          lastSavedAt: Date.now(),
        };
        localStorage.setItem(COMPANY_DRAFT_KEY, JSON.stringify(draftData));
      } catch (err) {
        console.warn('Unable to persist draft to localStorage:', err);
      }
    }
  }, [
    companyPlace,
    regName,
    regCategory,
    regCustomCategory,
    regSubCategory,
    regAddress,
    regNeighborhood,
    regCity,
    regWhatsapp,
    regPhone,
    regInstagram,
    regHours,
    regDescription,
    regLogoUrl,
    regImageUrl,
    regLat,
    regLng,
    hasPickedCoord,
    regFirstProdName,
    regFirstProdPrice,
  ]);

  // Handle picked coordinates from parent map and persist them
  useEffect(() => {
    if (pickedCoord) {
      if (companyPlace) {
        setPlaceLat(pickedCoord.lat);
        setPlaceLng(pickedCoord.lng);
        setHasChangedLocation(true);
        setActiveTab('location');
        setSuccessMsg(`📍 Novo ponto no mapa selecionado! (${pickedCoord.lat.toFixed(4)}, ${pickedCoord.lng.toFixed(4)}). Salve para confirmar.`);
        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        setRegLat(pickedCoord.lat);
        setRegLng(pickedCoord.lng);
        setHasPickedCoord(true);
        setSuccessMsg(`Ponto no mapa definido com sucesso! (${pickedCoord.lat.toFixed(4)}, ${pickedCoord.lng.toFixed(4)})`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    }
  }, [pickedCoord, companyPlace]);

  // Clean all form fields if user chooses to start over
  const handleClearDraft = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os campos preenchidos e reiniciar o formulário?')) {
      try {
        localStorage.removeItem(COMPANY_DRAFT_KEY);
      } catch (e) {}
      setRegName('');
      setRegCategory('restaurant');
      setRegCustomCategory('');
      setRegSubCategory('Alimentação & Lanches');
      setRegAddress('');
      setRegNeighborhood(currentUser?.neighborhood || 'Curado IV');
      setRegCity('Recife');
      setRegWhatsapp(currentUser?.phone || '');
      setRegPhone('');
      setRegInstagram('');
      setRegHours('Seg a Sáb: 08:00 às 20:00');
      setRegDescription('Atendimento com excelência e qualidade no bairro!');
      setRegLogoUrl('');
      setRegImageUrl('');
      setRegLat(-8.0645);
      setRegLng(-34.9855);
      setHasPickedCoord(false);
      setRegFirstProdName('');
      setRegFirstProdPrice('');
      setSuccessMsg('Formulário limpo com sucesso.');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  // Safe handler to pick location on map without losing form data
  const handleStartPickLocationOnMap = () => {
    // Explicitly guarantee saving state right before unmounting/closing
    try {
      const draftData = {
        regName,
        regCategory,
        regCustomCategory,
        regSubCategory,
        regAddress,
        regNeighborhood,
        regCity,
        regWhatsapp,
        regPhone,
        regInstagram,
        regHours,
        regDescription,
        regLogoUrl: regLogoUrl.length < 300000 ? regLogoUrl : '',
        regImageUrl: regImageUrl.length < 300000 ? regImageUrl : '',
        regLat,
        regLng,
        hasPickedCoord,
        regFirstProdName,
        regFirstProdPrice,
        lastSavedAt: Date.now(),
      };
      localStorage.setItem(COMPANY_DRAFT_KEY, JSON.stringify(draftData));
    } catch (e) {}
    onClose();
    if (onStartPickingLocation) {
      onStartPickingLocation();
    }
  };

  // Sync state when companyPlace updates - clean without pre-ready unsplash images
  useEffect(() => {
    if (companyPlace) {
      setName(companyPlace.name);
      setCategory(companyPlace.category);
      setCustomCategory(companyPlace.customCategory || '');
      setSubCategory(companyPlace.subCategory);
      setAddress(companyPlace.address);
      setNeighborhood(companyPlace.neighborhood);
      setCity(companyPlace.city);
      setPhone(companyPlace.phone || '');
      setWhatsapp(companyPlace.whatsapp || '');
      setHours(companyPlace.hours || '');
      setDescription(companyPlace.description || '');
      setImageUrl(cleanInitialImage(companyPlace.imageUrl));
      setLogoUrl(cleanInitialImage(companyPlace.logoUrl));
      setInstagram(companyPlace.instagram || '');
      setWebsite(companyPlace.website || '');
      setIsPaused(Boolean(companyPlace.isPaused));
      setPriceRange(companyPlace.priceRange || '$$');
      setPlaceLat(typeof companyPlace.lat === 'number' ? companyPlace.lat : parseFloat(String(companyPlace.lat)) || -8.0645);
      setPlaceLng(typeof companyPlace.lng === 'number' ? companyPlace.lng : parseFloat(String(companyPlace.lng)) || -34.9855);
      setHasChangedLocation(false);
      if (companyPlace.productsOrServices) {
        setProducts(companyPlace.productsOrServices);
      }
    }
  }, [companyPlace]);

  // File upload helper uploading to Firebase Storage or optimized DataURL fallback
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    target: 'logo' | 'image' | 'prod' | 'regLogo' | 'regImage'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(target);
    setErrorMsg('');
    try {
      const activeUserId = currentUser?.uid || currentUser?.id || auth.currentUser?.uid || (companyPlace?.ownerId) || 'company_user';
      
      const publicUrl = await uploadCompanyImage(activeUserId, file);
      
      if (!publicUrl) {
        throw new Error('Não foi possível obter a imagem da galeria.');
      }

      if (target === 'logo') {
        setLogoUrl(publicUrl);
        if (companyPlace) {
          await saveCompanyToFirestore(activeUserId, {
            ...companyPlace,
            logoUrl: publicUrl,
          }, companyPlace.id);
          onPlaceUpdated({ ...companyPlace, logoUrl: publicUrl });
        }
      } else if (target === 'image') {
        setImageUrl(publicUrl);
        if (companyPlace) {
          await saveCompanyToFirestore(activeUserId, {
            ...companyPlace,
            photoUrl: publicUrl,
            imageUrl: publicUrl,
          }, companyPlace.id);
          onPlaceUpdated({ ...companyPlace, photoUrl: publicUrl, imageUrl: publicUrl });
        }
      } else if (target === 'prod') {
        setNewProdImage(publicUrl);
      } else if (target === 'regLogo') {
        setRegLogoUrl(publicUrl);
      } else if (target === 'regImage') {
        setRegImageUrl(publicUrl);
      }

      setSuccessMsg('📸 Foto da galeria carregada e salva com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      console.error('Error handling gallery file:', err);
      const msg = err?.message || 'Falha ao processar arquivo da galeria.';
      setErrorMsg(`Erro no envio da foto: ${msg}`);
    } finally {
      setUploadingTarget(null);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Google 1-click Login if not logged in
  const handleDirectLogin = async () => {
    setLoggingIn(true);
    setErrorMsg('');
    try {
      const user = await loginWithGoogle('empresa');
      if (onUserUpdated) onUserUpdated(user);
      setRegName(user.companyName || user.name || '');
      setSuccessMsg(`Bem-vindo, ${user.name}! Agora preencha os dados da sua empresa.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Falha ao autenticar com o Google. Tente novamente.');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  // Publish NEW Company to Firestore
  const handlePublishCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim()) {
      setErrorMsg('Informe o nome da empresa.');
      return;
    }
    if (!regAddress.trim()) {
      setErrorMsg('Informe o endereço do estabelecimento.');
      return;
    }

    setPublishing(true);

    try {
      const finalImage = cleanInitialImage(regImageUrl.trim()) || cleanInitialImage(regLogoUrl.trim()) || '';
      const finalLogo = cleanInitialImage(regLogoUrl.trim()) || finalImage;

      // Initial products list
      const initialProducts: ProductItem[] = [];
      if (regFirstProdName.trim()) {
        initialProducts.push({
          id: `prod-${Date.now()}`,
          name: regFirstProdName.trim(),
          price: regFirstProdPrice.trim() || '',
          description: 'Item inicial cadastrado',
          imageUrl: '',
        });
      }

      const finalCategoryLabel =
        regCategory === 'other' && regCustomCategory.trim()
          ? regCustomCategory.trim()
          : CATEGORY_CONFIG[regCategory]?.name || 'Geral';

      const activeUserId = currentUser?.uid || currentUser?.id || auth.currentUser?.uid || `owner-${Date.now()}`;

      // Save to Cloud Firestore collection `companies`
      const savedCompany = await saveCompanyToFirestore(activeUserId, {
        name: regName.trim(),
        category: regCategory,
        customCategory: regCategory === 'other' && regCustomCategory.trim() ? regCustomCategory.trim() : '',
        subCategory: regSubCategory.trim() || finalCategoryLabel,
        description: regDescription.trim() || 'Empresa verificada no bairro com atendimento de excelência.',
        address: regAddress.trim(),
        neighborhood: regNeighborhood.trim() || 'Curado IV',
        city: regCity.trim() || 'Recife',
        lat: regLat,
        lng: regLng,
        whatsapp: regWhatsapp.trim() || '',
        phone: regPhone.trim() || '',
        instagram: regInstagram.trim() || '',
        website: '',
        hours: regHours.trim() || '',
        photoUrl: finalImage || '',
        imageUrl: finalImage || '',
        logoUrl: finalLogo || '',
        productsOrServices: initialProducts,
      });

      const createdObj: Place = {
        id: savedCompany.id,
        name: savedCompany.name,
        category: regCategory,
        customCategory: savedCompany.customCategory,
        subCategory: savedCompany.subCategory || finalCategoryLabel,
        description: savedCompany.description || '',
        address: savedCompany.address,
        neighborhood: savedCompany.neighborhood,
        city: savedCompany.city,
        lat: savedCompany.lat,
        lng: savedCompany.lng,
        whatsapp: savedCompany.whatsapp,
        phone: savedCompany.phone,
        instagram: savedCompany.instagram,
        hours: savedCompany.hours,
        imageUrl: finalImage,
        logoUrl: finalLogo,
        isRegisteredCompany: true,
        priceRange: '$$' as const,
        tags: [regCategory, regSubCategory.trim(), regNeighborhood.trim(), 'Empresa Cadastrada', 'BairrosCity'],
        ownerId: activeUserId,
        ownerName: currentUser?.name || regName.trim(),
        ownerEmail: currentUser?.email || '',
        productsOrServices: initialProducts,
        rating: 5.0,
        reviewsCount: 1,
        reviews: [],
        createdAt: savedCompany.createdAt,
      };

      // Upgrade user profile to role company if logged in
      if (currentUser) {
        try {
          await updateUserProfile(currentUser.id, {
            role: 'company',
            companyName: regName.trim(),
            neighborhood: regNeighborhood,
          });
          if (onUserUpdated) {
            onUserUpdated({
              ...currentUser,
              role: 'company',
              companyName: regName.trim(),
            });
          }
        } catch (e) {
          console.warn('Could not update user role:', e);
        }
      }

      if (onPlaceCreated) {
        onPlaceCreated(createdObj);
      } else {
        onPlaceUpdated(createdObj);
      }

      setProducts(initialProducts);
      setActiveTab('products');
      try {
        localStorage.removeItem(COMPANY_DRAFT_KEY);
      } catch (e) {}
      setSuccessMsg('🎉 Empresa publicada e salva no Cloud Firestore! Já está visível no mapa.');
    } catch (err: any) {
      console.error('Error publishing company:', err);
      const msg = err?.message || 'Verifique a conexão e as regras de segurança do Firestore.';
      setErrorMsg('Erro ao publicar empresa no banco de dados: ' + msg);
      alert(`Erro ao salvar empresa no Firestore:\n${msg}\n\nVerifique se as Regras do Firestore permitem gravação.`);
    } finally {
      setPublishing(false);
    }
  };

  // Save changes to existing company
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!companyPlace) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const exactCategory =
        category === 'other' && customCategory.trim()
          ? customCategory.trim()
          : customCategory.trim() || subCategory.trim() || CATEGORY_CONFIG[category]?.name || 'Geral';

      const activeUserId = currentUser?.uid || currentUser?.id || auth.currentUser?.uid || companyPlace.ownerId || 'empresa_user';
      const companyId = companyPlace.id || `comp-${activeUserId}`;

      const finalLat = typeof placeLat === 'number' ? placeLat : parseFloat(String(placeLat)) || -8.0645;
      const finalLng = typeof placeLng === 'number' ? placeLng : parseFloat(String(placeLng)) || -34.9855;

      const companyData = {
        id: companyId,
        userId: activeUserId,
        name: name.trim() || 'Empresa Sem Nome',
        category: category || 'services',
        customCategory: customCategory.trim() || (category === 'other' ? exactCategory : ''),
        subCategory: exactCategory,
        address: address.trim() || '',
        neighborhood: neighborhood || 'Curado IV',
        city: city.trim() || 'Recife',
        lat: finalLat,
        lng: finalLng,
        phone: phone.trim() || '',
        whatsapp: whatsapp.trim() || '',
        hours: hours.trim() || '',
        description: description.trim() || '',
        imageUrl: cleanInitialImage(imageUrl.trim()) || '',
        photoUrl: cleanInitialImage(imageUrl.trim()) || '',
        logoUrl: cleanInitialImage(logoUrl.trim()) || '',
        instagram: instagram.trim() || '',
        website: website.trim() || '',
        isPaused: Boolean(isPaused),
        priceRange: priceRange || '$$',
        productsOrServices: products || [],
        updatedAt: new Date().toISOString(),
      };

      const cleanCompanyData = sanitizeFirestoreData(companyData);

      // Save using saveCompanyToFirestore which systematically purges old location records for this user
      await saveCompanyToFirestore(activeUserId, cleanCompanyData, companyId);
      console.log(`[Firestore] Company updated & previous locations cleaned for ${activeUserId}`);

      if (currentUser && name.trim() !== currentUser.companyName) {
        await updateUserProfile(currentUser.id, { companyName: name.trim() });
      }

      const updatedObj: Place = {
        ...companyPlace,
        ...cleanCompanyData,
        lat: finalLat,
        lng: finalLng,
        customCategory: cleanCompanyData.customCategory || '',
        subCategory: exactCategory,
      };

      setHasChangedLocation(false);
      onPlaceUpdated(updatedObj);
      setSuccessMsg('✅ Dados e localização da empresa atualizados com sucesso no banco de dados!');
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err: any) {
      console.error('Error saving company in Firestore:', err);
      const msg = err?.message || 'Verifique sua conexão e as regras de segurança do Firestore.';
      setErrorMsg('❌ Erro ao salvar dados no banco: ' + msg);
      alert(`Erro ao salvar dados no Firestore:\n${msg}\n\nVerifique se as Regras do Firestore permitem gravação.`);
    } finally {
      setSaving(false);
    }
  };

  // Add Product to catalog
  const handleAddProduct = async () => {
    if (!newProdName.trim()) {
      setErrorMsg('Informe o nome do produto ou serviço.');
      return;
    }
    setErrorMsg('');

    const item: ProductItem = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      price: newProdPrice.trim() || '',
      description: newProdDesc.trim() || '',
      imageUrl: newProdImage.trim() || '',
    };

    const updatedList = [...products, item];
    setProducts(updatedList);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    setNewProdImage('');

    if (companyPlace) {
      try {
        await updatePlaceInFirestore(companyPlace.id, { productsOrServices: updatedList });
        onPlaceUpdated({ ...companyPlace, productsOrServices: updatedList });
        setSuccessMsg(`"${item.name}" adicionado ao catálogo com sucesso!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        console.warn('Could not auto-save product:', err);
      }
    }
  };

  // Remove Product
  const handleRemoveProduct = async (id: string) => {
    const updatedList = products.filter((p) => p.id !== id);
    setProducts(updatedList);

    if (companyPlace) {
      try {
        await updatePlaceInFirestore(companyPlace.id, { productsOrServices: updatedList });
        onPlaceUpdated({ ...companyPlace, productsOrServices: updatedList });
        setSuccessMsg('Item removido do catálogo.');
        setTimeout(() => setSuccessMsg(''), 2500);
      } catch (err) {
        console.warn('Could not auto-save removal:', err);
      }
    }
  };

  // Toggle pause status
  const handleTogglePause = async () => {
    if (!companyPlace) return;
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    try {
      await updatePlaceInFirestore(companyPlace.id, { isPaused: newPaused });
      onPlaceUpdated({ ...companyPlace, isPaused: newPaused });
      setSuccessMsg(newPaused ? 'Estabelecimento pausado temporariamente.' : 'Estabelecimento reativado!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="company-manager-backdrop"
      className="fixed inset-0 z-[1300] bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="company-manager-content"
        className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl bg-slate-900 border-0 sm:border border-slate-700/80 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-400/20 border border-lime-400/40 text-lime-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                  {companyPlace ? companyPlace.name : 'Cadastro Oficial da Empresa'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-lime-400/15 border border-lime-400/30 text-lime-400 text-[10px] font-black uppercase">
                  {companyPlace ? 'No Ar no Mapa' : 'Google Maps Style'}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {companyPlace 
                  ? 'Gerencie catálogo de produtos, fotos, Instagram e presença no mapa'
                  : 'Cadastre seu estabelecimento com fotos, contatos e localização exata'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!companyPlace && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-400 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Limpar todos os campos e recomeçar o cadastro"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Success / Error Banners */}
        {successMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs flex items-center gap-2 animate-in fade-in shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* CASE 1: USER NOT LOGGED IN */}
        {!currentUser ? (
          <div className="p-8 text-center space-y-5 max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-3xl bg-lime-400/15 border border-lime-400/30 text-lime-400 mx-auto flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white">
              Cadastre ou Gerencie sua Empresa
            </h3>
            <p className="text-sm text-slate-400">
              Faça login em 1 clique com sua conta Google para cadastrar seu estabelecimento, publicar fotos, produtos com preços e aparecer no mapa regional.
            </p>
            <button
              type="button"
              onClick={handleDirectLogin}
              disabled={loggingIn}
              className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loggingIn ? 'Conectando...' : 'Entrar com Google em 1 Clique'}</span>
            </button>
          </div>
        ) : !companyPlace ? (
          /* CASE 2: USER LOGGED IN BUT DOES NOT HAVE A COMPANY REGISTERED YET */
          <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 overscroll-contain">
            {/* Auto-save & Status Banner */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Dados pré-salvos automaticamente no navegador</span>
              </div>
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-slate-400 hover:text-rose-400 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar formulário</span>
              </button>
            </div>

            {/* Live Map Marker Preview Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-lime-400/30">
              <div className="text-[11px] font-bold text-lime-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prévia do Pino no Google Maps:</span>
              </div>
              
              {/* Authentic Map Pin Preview */}
              <div className="py-2.5 px-3 sm:px-4 flex items-center gap-3 bg-slate-900/95 rounded-xl border border-slate-800 shadow-lg">
                <div className="relative w-12 h-12 min-w-[48px] rounded-full bg-white border-2 border-lime-400 flex items-center justify-center shadow-md overflow-hidden">
                  {regLogoUrl || regImageUrl ? (
                    <img
                      src={regLogoUrl || regImageUrl}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-700" />
                  )}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-lime-400 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black text-slate-950">
                    ✓
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-white text-sm truncate">
                      {regName.trim() || 'Nome da Sua Empresa'}
                    </span>
                    <span className="px-1.5 py-0.5 bg-lime-400 text-slate-950 text-[9px] font-black rounded shrink-0">
                      BairrosCity
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {regSubCategory || 'Comércio & Serviços'} • {regNeighborhood}, {regCity}
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handlePublishCompany} className="space-y-6">
              {/* Hidden file inputs with refs for professional custom upload buttons */}
              <input
                type="file"
                ref={regLogoFileInputRef}
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'regLogo')}
                className="hidden"
              />
              <input
                type="file"
                ref={regImageFileInputRef}
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'regImage')}
                className="hidden"
              />

              {/* Photos Upload Cards - Professional Google Maps Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Logo / Avatar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-lime-400" />
                        <span>Logomarca / Foto de Perfil</span>
                        <span className="text-lime-400">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full">
                        Pino do Mapa
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Esta foto aparece dentro do círculo do pino no mapa.
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5">
                    {uploadingTarget === 'regLogo' ? (
                      <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-lime-400 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : regLogoUrl ? (
                      <div className="relative group shrink-0">
                        <img
                          src={regLogoUrl}
                          alt="Logo"
                          className="w-16 h-16 rounded-full object-cover border-2 border-lime-400 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setRegLogoUrl('')}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow cursor-pointer transition-colors"
                          title="Remover foto"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => regLogoFileInputRef.current?.click()}
                        className="w-16 h-16 rounded-full bg-slate-900 border-2 border-dashed border-slate-600 hover:border-lime-400 flex flex-col items-center justify-center text-slate-400 hover:text-lime-400 shrink-0 cursor-pointer transition-colors"
                        title="Clique para carregar foto"
                      >
                        <Camera className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        disabled={uploadingTarget === 'regLogo'}
                        onClick={() => regLogoFileInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-95 disabled:opacity-60"
                      >
                        {uploadingTarget === 'regLogo' ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>Carregando Foto...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{regLogoUrl ? 'Trocar da Galeria' : 'Escolher da Galeria'}</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-slate-400">
                        {regLogoUrl ? 'Foto selecionada' : 'Nenhuma imagem escolhida'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Foto de Capa / Fachada */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>Foto da Fachada / Ambiente</span>
                      </label>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                        Capa
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Foto grande exibida na aba detalhada da empresa.
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5">
                    {uploadingTarget === 'regImage' ? (
                      <div className="w-20 h-16 rounded-xl bg-slate-900 border-2 border-blue-400 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : regImageUrl ? (
                      <div className="relative group shrink-0">
                        <img
                          src={regImageUrl}
                          alt="Fachada"
                          className="w-20 h-16 rounded-xl object-cover border border-slate-600 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setRegImageUrl('')}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow cursor-pointer transition-colors"
                          title="Remover foto"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => regImageFileInputRef.current?.click()}
                        className="w-20 h-16 rounded-xl bg-slate-900 border-2 border-dashed border-slate-600 hover:border-blue-400 flex flex-col items-center justify-center text-slate-400 hover:text-blue-400 shrink-0 cursor-pointer transition-colors"
                        title="Clique para carregar fachada"
                      >
                        <Upload className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        disabled={uploadingTarget === 'regImage'}
                        onClick={() => regImageFileInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-95 disabled:opacity-60"
                      >
                        {uploadingTarget === 'regImage' ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Carregando Foto...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{regImageUrl ? 'Trocar da Galeria' : 'Escolher da Galeria'}</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-slate-400">
                        {regImageUrl ? 'Foto da fachada selecionada' : 'Nenhuma imagem escolhida'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Identificação */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>1. Identificação da Empresa</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Nome Comercial da Empresa <span className="text-lime-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Padaria Bella Vista, Barbearia Silva"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-semibold placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Categoria Principal <span className="text-lime-400">*</span>
                    </label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value as CategoryType)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400 transition-colors cursor-pointer"
                    >
                      {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key} className="bg-slate-900 text-white">
                          {cfg.name}
                        </option>
                      ))}
                    </select>

                    {regCategory === 'other' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          required
                          placeholder="Digite o nome da sua categoria (ex: Vidraçaria, Papelaria)"
                          value={regCustomCategory}
                          onChange={(e) => setRegCustomCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-lime-400/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Especialidade / Ramo de Atuação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Pizzas artesanais, Cortes modernos, Peças para motos"
                    value={regSubCategory}
                    onChange={(e) => setRegSubCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                  />
                </div>
              </div>

              {/* Section 2: Localização & Ponto no Mapa */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>2. Localização & Ponto Exato no Mapa</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Bairro Regional <span className="text-lime-400">*</span>
                    </label>
                    <select
                      value={regNeighborhood}
                      onChange={(e) => setRegNeighborhood(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400 transition-colors cursor-pointer"
                    >
                      {NEIGHBORHOODS.map((b) => (
                        <option key={b} value={b} className="bg-slate-900 text-white">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Cidade <span className="text-lime-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Endereço Completo & Referência <span className="text-lime-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Rua, número, galpão, sala ou ponto de referência conhecido"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Interactive Map Location Card with Pre-Saved Assurance */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  hasPickedCoord
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : 'bg-blue-950/40 border-blue-500/40'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        hasPickedCoord
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}>
                        {hasPickedCoord ? (
                          <CheckCheck className="w-5 h-5" />
                        ) : (
                          <Compass className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {hasPickedCoord ? 'Ponto Marcado no Mapa com Sucesso' : 'Posicionamento do Pino no Mapa'}
                          </span>
                          {hasPickedCoord && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                              ✓ Confirmado
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          {hasPickedCoord ? (
                            <span>Coordenadas exatas: <strong>{regLat.toFixed(5)}, {regLng.toFixed(5)}</strong></span>
                          ) : (
                            <span>Clique para abrir o mapa e escolher a posição do seu pino. O que você preencheu <strong>não será perdido</strong>.</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartPickLocationOnMap}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md transition-all active:scale-95 ${
                        hasPickedCoord
                          ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                      }`}
                    >
                      <Compass className="w-4 h-4" />
                      <span>{hasPickedCoord ? 'Alterar no Mapa' : 'Definir Ponto no Mapa'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Canais de Contato & Horário */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>3. Canais de Atendimento & Horário</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      WhatsApp Comercial <span className="text-lime-400">*</span>
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                      <input
                        type="tel"
                        required
                        placeholder="(81) 98888-7777"
                        value={regWhatsapp}
                        onChange={(e) => setRegWhatsapp(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Instagram Oficial
                    </label>
                    <div className="relative">
                      <Instagram className="w-4 h-4 absolute left-3 top-3 text-pink-400" />
                      <input
                        type="text"
                        placeholder="@seunegocio"
                        value={regInstagram}
                        onChange={(e) => setRegInstagram(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Horário de Funcionamento
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-3 text-amber-400" />
                      <input
                        type="text"
                        placeholder="Seg a Sáb: 08:00 às 20:00"
                        value={regHours}
                        onChange={(e) => setRegHours(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Sobre a Empresa */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>4. Sobre o Estabelecimento</span>
                </div>

                <textarea
                  rows={2}
                  value={regDescription}
                  onChange={(e) => setRegDescription(e.target.value)}
                  placeholder="Conte um pouco sobre sua empresa, produtos que vende, formas de pagamento (Pix, cartões) e diferenciais..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                />
              </div>

              {/* Section 5: Item Inicial do Catálogo (Opcional) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>5. Primeiro Item do Catálogo (Opcional)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Poderá adicionar mais depois</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nome do produto ou serviço (ex: Marmita Especial)"
                    value={regFirstProdName}
                    onChange={(e) => setRegFirstProdName(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Preço (ex: R$ 25,00)"
                    value={regFirstProdPrice}
                    onChange={(e) => setRegFirstProdPrice(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons: Submit & Clear */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={publishing}
                  className="w-full py-4 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2.5 cursor-pointer transition-all disabled:opacity-50 active:scale-[0.99]"
                >
                  {publishing ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
                      <span>Publicar Minha Empresa no Mapa Agora</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer py-1 px-3"
                  >
                    Limpar campos preenchidos e reiniciar
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* CASE 3: COMPANY IS REGISTERED - FULL MANAGEMENT DASHBOARD */
          <>
            {/* Tab Navigation */}
            <div className="px-5 sm:px-6 pt-3 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'products'
                    ? 'border-lime-400 text-lime-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Catálogo & Produtos ({products.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'details'
                    ? 'border-lime-400 text-lime-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Dados, Fotos & Redes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'border-lime-400 text-lime-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Métricas & Visão Geral</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('location')}
                className={`py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'location'
                    ? 'border-lime-400 text-lime-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Ponto no Mapa</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              {/* TAB 1: PRODUCTS & CATALOG MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* Banner */}
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white">
                        Catálogo de Produtos & Serviços
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tudo o que você adicionar aqui fica salvo no banco e aparece imediatamente para todos os visitantes do site.
                      </p>
                    </div>
                    {companyPlace && onViewOnMap && (
                      <button
                        type="button"
                        onClick={() => onViewOnMap(companyPlace)}
                        className="px-3.5 py-2 rounded-xl bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver no Mapa</span>
                      </button>
                    )}
                  </div>

                  {/* Add New Product Form */}
                  <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Novo Item ao Catálogo</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Nome do Produto / Serviço <span className="text-lime-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: X-Bacon Artesanal, Corte Masculino"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Preço <span className="text-lime-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: R$ 28,00 ou A partir de R$ 15,00"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Descrição / Ingredientes / Detalhes
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Pão brioche, blend 160g, queijo cheddar e bacon crocante."
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                      />
                    </div>

                    {/* Product Photo - Somente Galeria */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Foto do Produto (Opcional - da Galeria)
                      </label>
                      <input
                        type="file"
                        ref={prodFileInputRef}
                        accept="image/*"
                        disabled={uploadingTarget === 'prod'}
                        onChange={(e) => handleFileUpload(e, 'prod')}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3">
                        {uploadingTarget === 'prod' ? (
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-lime-400 flex items-center justify-center shrink-0">
                            <div className="w-4 h-4 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : newProdImage ? (
                          <div className="relative group shrink-0">
                            <img
                              src={newProdImage}
                              alt="Preview"
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setNewProdImage('')}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] shadow cursor-pointer transition-colors"
                              title="Remover foto do produto"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => prodFileInputRef.current?.click()}
                            className="w-12 h-12 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-lime-400 flex items-center justify-center text-slate-500 hover:text-lime-400 shrink-0 cursor-pointer transition-colors"
                            title="Escolher foto da galeria"
                          >
                            <Camera className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 flex items-center gap-2">
                          <button
                            type="button"
                            disabled={uploadingTarget === 'prod'}
                            onClick={() => prodFileInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow-sm active:scale-95 disabled:opacity-60"
                          >
                            {uploadingTarget === 'prod' ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Enviando...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>{newProdImage ? 'Trocar da Galeria' : 'Escolher da Galeria'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all ml-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar ao Catálogo</span>
                    </button>
                  </div>

                  {/* List of Products */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Itens Ativos no Cardápio ({products.length})
                      </h4>
                      <span className="text-[11px] text-lime-400 font-semibold">
                        Visível para todos os usuários
                      </span>
                    </div>

                    {products.length === 0 ? (
                      <div className="p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">
                        <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">
                          Seu catálogo ainda não tem produtos cadastrados. Adicione o primeiro item acima!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5">
                        {products.map((prod) => (
                          <div
                            key={prod.id}
                            className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-between gap-4 hover:border-slate-600 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                  <ShoppingBag className="w-5 h-5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white truncate">
                                    {prod.name}
                                  </span>
                                  {prod.price && (
                                    <span className="px-2 py-0.5 rounded-md bg-lime-400/20 text-lime-400 text-xs font-black">
                                      {prod.price}
                                    </span>
                                  )}
                                </div>
                                {prod.description && (
                                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                    {prod.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(prod.id)}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              title="Remover produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DETAILS & PHOTOS & SOCIAL NETWORKS */}
              {activeTab === 'details' && (
                <form onSubmit={handleSaveAll} className="space-y-5">
                  {/* Name & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Categoria Principal <span className="text-lime-400">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryType)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400"
                      >
                        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key} className="bg-slate-900 text-white">
                            {cfg.name}
                          </option>
                        ))}
                      </select>
                      {category === 'other' && (
                        <div className="mt-2.5">
                          <label className="block text-[11px] font-bold text-lime-400 mb-1">
                            Escreva o nome da sua Categoria Personalizada *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Vidraçaria, Papelaria, Assistência Técnica, etc."
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-lime-400/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SubCategory, Neighborhood, City */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Subcategoria
                      </label>
                      <input
                        type="text"
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Bairro
                      </label>
                      <select
                        value={neighborhood}
                        onChange={(e) => {
                          const newNb = e.target.value;
                          setNeighborhood(newNb);
                          if (!hasChangedLocation && NEIGHBORHOOD_COORDINATES[newNb]) {
                            setPlaceLat(NEIGHBORHOOD_COORDINATES[newNb].lat);
                            setPlaceLng(NEIGHBORHOOD_COORDINATES[newNb].lng);
                            setHasChangedLocation(true);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400"
                      >
                        {NEIGHBORHOODS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Endereço Completo
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400"
                      />
                    </div>
                  </div>

                  {/* Contacts: WhatsApp, Instagram, Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        WhatsApp Comercial
                      </label>
                      <div className="relative">
                        <MessageCircle className="w-4 h-4 absolute left-3 top-2.5 text-emerald-400" />
                        <input
                          type="tel"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="(81) 98888-7777"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Instagram (@perfil)
                      </label>
                      <div className="relative">
                        <Instagram className="w-4 h-4 absolute left-3 top-2.5 text-pink-400" />
                        <input
                          type="text"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          placeholder="@suaempresa"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Telefone Comercial
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(81) 3333-2222"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hours & Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Horários de Funcionamento
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Website ou Link de Pedidos
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 absolute left-3 top-2.5 text-blue-400" />
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Sobre a Empresa
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400"
                    />
                  </div>

                  {/* Hidden file inputs for Tab 2 gallery upload */}
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    accept="image/*"
                    disabled={uploadingTarget === 'logo'}
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={imageFileInputRef}
                    accept="image/*"
                    disabled={uploadingTarget === 'image'}
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                  />

                  {/* Photos: Logo & Fachada - Somente da Galeria */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    {/* Logomarca */}
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-lime-400" />
                            <span>Logomarca (Pino do Mapa)</span>
                          </label>
                          <span className="text-[10px] font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full">
                            Pino Redondo
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Aparece dentro do círculo do pino no mapa.
                        </p>
                      </div>

                      <div className="flex items-center gap-3.5">
                        {uploadingTarget === 'logo' ? (
                          <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-lime-400 flex flex-col items-center justify-center shrink-0">
                            <div className="w-5 h-5 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : logoUrl ? (
                          <div className="relative group shrink-0">
                            <img
                              src={logoUrl}
                              alt="Logo"
                              className="w-16 h-16 rounded-full object-cover border-2 border-lime-400 shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => setLogoUrl('')}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow cursor-pointer transition-colors"
                              title="Remover logomarca"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => logoFileInputRef.current?.click()}
                            className="w-16 h-16 rounded-full bg-slate-900 border-2 border-dashed border-slate-600 hover:border-lime-400 flex flex-col items-center justify-center text-slate-400 hover:text-lime-400 shrink-0 cursor-pointer transition-colors"
                            title="Escolher logomarca da galeria"
                          >
                            <Camera className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1 space-y-1.5">
                          <button
                            type="button"
                            disabled={uploadingTarget === 'logo'}
                            onClick={() => logoFileInputRef.current?.click()}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-95 disabled:opacity-60"
                          >
                            {uploadingTarget === 'logo' ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                <span>Carregando Foto...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>{logoUrl ? 'Trocar da Galeria' : 'Escolher da Galeria'}</span>
                              </>
                            )}
                          </button>
                          <p className="text-[10px] text-slate-400">
                            {logoUrl ? 'Logomarca selecionada' : 'Nenhuma imagem escolhida'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Foto da Fachada */}
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                            <span>Foto da Fachada / Ambiente</span>
                          </label>
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                            Foto Principal
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Exibida no perfil detalhado da empresa.
                        </p>
                      </div>

                      <div className="flex items-center gap-3.5">
                        {uploadingTarget === 'image' ? (
                          <div className="w-20 h-16 rounded-xl bg-slate-900 border-2 border-blue-400 flex flex-col items-center justify-center shrink-0">
                            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : imageUrl ? (
                          <div className="relative group shrink-0">
                            <img
                              src={imageUrl}
                              alt="Fachada"
                              className="w-20 h-16 rounded-xl object-cover border border-slate-600 shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow cursor-pointer transition-colors"
                              title="Remover foto"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => imageFileInputRef.current?.click()}
                            className="w-20 h-16 rounded-xl bg-slate-900 border-2 border-dashed border-slate-600 hover:border-blue-400 flex flex-col items-center justify-center text-slate-400 hover:text-blue-400 shrink-0 cursor-pointer transition-colors"
                            title="Escolher fachada da galeria"
                          >
                            <Upload className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1 space-y-1.5">
                          <button
                            type="button"
                            disabled={uploadingTarget === 'image'}
                            onClick={() => imageFileInputRef.current?.click()}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-95 disabled:opacity-60"
                          >
                            {uploadingTarget === 'image' ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Carregando Foto...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>{imageUrl ? 'Trocar da Galeria' : 'Escolher da Galeria'}</span>
                              </>
                            )}
                          </button>
                          <p className="text-[10px] text-slate-400">
                            {imageUrl ? 'Foto da fachada selecionada' : 'Nenhuma imagem escolhida'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="w-full py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 active:scale-[0.99]"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Salvar Alterações no Banco</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: OVERVIEW & METRICS */}
              {activeTab === 'overview' && companyPlace && (
                <div className="space-y-5">
                  {/* Status Banner */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isPaused ? 'bg-amber-400/20 text-amber-400' : 'bg-lime-400/20 text-lime-400'
                        }`}
                      >
                        {isPaused ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">
                          Status no Mapa: {isPaused ? 'Pausado Temporariamente' : 'Ativo e Visível'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {isPaused
                            ? 'Sua empresa está oculta no mapa até você reativar'
                            : 'Todos os moradores e visitantes do site podem ver seu negócio e catálogo'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTogglePause}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        isPaused
                          ? 'bg-lime-400 text-slate-950 border-lime-400'
                          : 'bg-slate-800 text-amber-400 border-amber-400/40 hover:bg-slate-700'
                      }`}
                    >
                      {isPaused ? 'Reativar Empresa' : 'Pausar'}
                    </button>
                  </div>

                  {/* Metrics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Visualizações</span>
                      </div>
                      <div className="text-2xl font-black text-white">
                        {companyPlace.viewsCount || 12}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Cliques WhatsApp</span>
                      </div>
                      <div className="text-2xl font-black text-white">
                        {companyPlace.whatsappClicks || 4}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-lime-400" />
                        <span>Produtos</span>
                      </div>
                      <div className="text-2xl font-black text-white">
                        {products.length}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Avaliação Média</span>
                      </div>
                      <div className="text-2xl font-black text-white">
                        {companyPlace.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Map Preview Action */}
                  {onViewOnMap && (
                    <button
                      type="button"
                      onClick={() => onViewOnMap(companyPlace)}
                      className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span>Ver Como Meus Clientes Veem no Mapa Regional</span>
                    </button>
                  )}
                </div>
              )}

              {/* TAB 4: LOCATION ON MAP */}
              {activeTab === 'location' && companyPlace && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-lime-400" />
                        <span>Coordenadas Geográficas no Google Maps</span>
                      </h4>
                      {hasChangedLocation && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-lime-400 text-slate-950 animate-pulse">
                          LOCALIZAÇÃO ALTERADA
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-300 leading-relaxed">
                      O pino no mapa define exatamente onde os clientes veem sua empresa quando pesquisam no bairro.
                      Ao mudar de endereço, o pino antigo é automaticamente removido do mapa.
                    </p>

                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Latitude Atual:</span>
                        <span className="text-lime-400 font-bold text-sm">{placeLat.toFixed(5)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Longitude Atual:</span>
                        <span className="text-lime-400 font-bold text-sm">{placeLng.toFixed(5)}</span>
                      </div>
                    </div>

                    {hasChangedLocation && (
                      <div className="p-3 rounded-xl bg-lime-400/10 border border-lime-400/40 text-lime-300 text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 text-lime-400 shrink-0" />
                        <span>Novo ponto selecionado no mapa! Clique abaixo para confirmar e remover o local antigo.</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                      {onStartPickingLocation && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onStartPickingLocation();
                          }}
                          className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                        >
                          <Compass className="w-4 h-4" />
                          <span>Selecionar Novo Ponto no Mapa</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleSaveAll()}
                        className="py-3 px-5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {saving ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>Salvando Local...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Salvar Nova Localização</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
