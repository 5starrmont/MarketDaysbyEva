import React, { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function ManageInventory() {
  // Data States
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI View States
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  
  // Drawer, Edit, Accordion & Settings States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [activeSettingsId, setActiveSettingsId] = useState(null);

  // Standalone Add Category Modal States
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [standaloneCategoryName, setStandaloneCategoryName] = useState("");
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Restock Modal States
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [restockVariantIndex, setRestockVariantIndex] = useState(0);
  const [isRestocking, setIsRestocking] = useState(false);

  // Drawer Inline Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  // Form State
  const emptyVariant = {
    unit_size: '', price: '', stock_quantity: '', reorder_level: '',
    discount_percentage: '', bulk_threshold: '', bulk_percentage: '',
    _showDiscount: false, _showBulk: false 
  };

  const initialFormState = {
    name: '', category: '', description: '', image: null, is_active: true,
    variants: [ { ...emptyVariant } ] 
  };

  const [formData, setFormData] = useState(initialFormState);
  const [imagePreview, setImagePreview] = useState(null);

  // ─── FETCH DATA & GLOBAL LISTENERS ───
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveSettingsId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/inventory/products/'),
        axios.get('http://127.0.0.1:8000/api/inventory/categories/')
      ]);
      setInventory(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ─── HELPER: GET PRODUCT PRICING, STOCK & INDIVIDUAL BADGES ───
  const getProductDisplayInfo = (item) => {
    const variants = item.variants || [];
    const count = variants.length;
    
    let priceDisplay = 'N/A';
    if (count > 0) {
      const prices = variants.map(v => parseFloat(v.price || 0));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      priceDisplay = minPrice === maxPrice 
        ? `KES ${minPrice.toLocaleString()}` 
        : `KES ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
    }

    const variantDetails = variants.map(v => {
      const stock = parseInt(v.stock_quantity || 0);
      const threshold = parseInt(v.reorder_level || 10);
      const price = parseFloat(v.price || 0);
      const discPrice = parseFloat(v.discount_price);
      const bulkPrice = parseFloat(v.bulk_price);
      
      let label = 'Out of Stock';
      let color = 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      let filterVal = 'out';
      
      if (stock > threshold) {
        label = 'In Stock';
        color = 'bg-[#EBF5EA] text-[#2D6A27] dark:bg-[#1A4D2E]/30 dark:text-[#7DC57A]';
        filterVal = 'in';
      } else if (stock > 0) {
        label = 'Low Stock';
        color = 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-500';
        filterVal = 'low';
      }

      let discountFormatted = '-';
      let bulkFormatted = '-';
      let hasDiscount = false;
      let hasBulkOffer = false;
      const variantBadges = [];

      if (discPrice && price > 0) {
        const pct = Math.round((1 - (discPrice / price)) * 100);
        discountFormatted = `KES ${discPrice.toLocaleString()} (-${pct}%)`;
        variantBadges.push(`-${pct}% OFF`);
        hasDiscount = true;
      }

      if (bulkPrice && v.bulk_threshold && price > 0) {
        const pct = Math.round((1 - (bulkPrice / price)) * 100);
        bulkFormatted = `KES ${bulkPrice.toLocaleString()} (-${pct}%)`;
        variantBadges.push('BULK OFFER');
        hasBulkOffer = true;
      }

      return {
        unit_size: v.unit_size,
        priceFormatted: price.toLocaleString(),
        stock, label, color, filterVal,
        reorder_level: v.reorder_level,
        discountFormatted,
        bulk_threshold: v.bulk_threshold,
        bulkFormatted,
        variantBadges,
        hasDiscount,
        hasBulkOffer
      };
    });

    return { count, priceDisplay, variantDetails };
  };

  // ─── HANDLE FORM INPUTS ───
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData(prev => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index] = { ...updatedVariants[index], [name]: finalValue };
      return { ...prev, variants: updatedVariants };
    });
  };

  const toggleVariantOffer = (index, field, currentValue) => {
    setFormData(prev => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index] = { ...updatedVariants[index], [field]: !currentValue };
      return { ...prev, variants: updatedVariants };
    });
  };

  const addVariant = () => setFormData(prev => ({ ...prev, variants: [...prev.variants, { ...emptyVariant }] }));
  const removeVariant = (index) => setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setFormData(prev => ({ ...prev, image: file })); setImagePreview(URL.createObjectURL(file)); }
  };

  // ─── DRAWER CONTROLS ───
  const openAddDrawer = () => {
    setFormData(initialFormState); setImagePreview(null); setIsEditMode(false); setEditingProductId(null); setIsDrawerOpen(true);
  };

  const openEditDrawer = (product, autoEnableOffer = null, variantIndex = null) => {
    const mappedVariants = product.variants?.length > 0 
      ? product.variants.map((v, i) => {
          const price = parseFloat(v.price) || 0;
          const discPrice = parseFloat(v.discount_price);
          const bulkPrice = parseFloat(v.bulk_price);
          
          let discPct = '';
          if (discPrice && price > 0) discPct = Math.round((1 - (discPrice / price)) * 100);
          
          let bulkPct = '';
          if (bulkPrice && price > 0) bulkPct = Math.round((1 - (bulkPrice / price)) * 100);

          return {
            unit_size: v.unit_size ?? '', price: v.price ?? '', stock_quantity: v.stock_quantity ?? '',
            reorder_level: v.reorder_level ?? '', 
            discount_percentage: discPct,
            bulk_threshold: v.bulk_threshold ?? '', 
            bulk_percentage: bulkPct,
            _showDiscount: (variantIndex === i && autoEnableOffer === 'discount') ? true : !!v.discount_price,
            _showBulk: (variantIndex === i && autoEnableOffer === 'bulk') ? true : (!!v.bulk_threshold || !!v.bulk_price)
          };
        })
      : [{ ...emptyVariant, _showDiscount: autoEnableOffer === 'discount', _showBulk: autoEnableOffer === 'bulk' }];

    setFormData({
      name: product.name || '', category: product.category?.id || product.category || '', 
      description: product.description || '', image: null, 
      is_active: product.is_active !== undefined ? product.is_active : true, variants: mappedVariants
    });

    setImagePreview(product.image || null); setIsEditMode(true); setEditingProductId(product.id); setIsDrawerOpen(true);
  };

  // ─── API ACTIONS ───
  const handleToggleOffer = async (e, product, variantIndex, offerType, isCurrentlyActive) => {
    e.stopPropagation();
    if (isCurrentlyActive) {
      if (!window.confirm(`Are you sure you want to remove the ${offerType} offer from this specific size?`)) return;
      
      const updatedVariants = product.variants.map((v, i) => {
        let nv = { ...v };
        if (i === variantIndex) {
          if (offerType === 'discount') nv.discount_price = null;
          else if (offerType === 'bulk') { nv.bulk_price = null; nv.bulk_threshold = null; }
        }
        return nv;
      });

      try {
        await axios.patch(`http://127.0.0.1:8000/api/inventory/products/${product.id}/`, { variants: JSON.stringify(updatedVariants) });
        fetchData();
      } catch (error) { alert("Failed to clear offer."); }
    } else {
      openEditDrawer(product, offerType, variantIndex);
    }
  };

  const toggleProductActive = async (e, product) => {
    e.stopPropagation();
    try {
      const originalState = product.is_active;
      setInventory(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !originalState } : p));
      await axios.patch(`http://127.0.0.1:8000/api/inventory/products/${product.id}/`, { is_active: !originalState });
    } catch (error) { alert("Failed to update status."); fetchData(); }
  };

  const deleteProduct = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try { await axios.delete(`http://127.0.0.1:8000/api/inventory/products/${id}/`); fetchData(); } 
    catch (error) { alert("Failed to delete product."); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? Products will become uncategorized.")) return;
    try { await axios.delete(`http://127.0.0.1:8000/api/inventory/categories/${id}/`); fetchData(); } 
    catch (error) { alert("Failed to delete category."); }
  };

  const handleDeleteVariant = async (e, product, variantIndex) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this size option?")) return;
    try {
      const updatedVariants = product.variants.filter((_, idx) => idx !== variantIndex);
      if (updatedVariants.length === 0 && !window.confirm("Deleting the last variant will leave 0 sizes. Continue?")) return;
      await axios.patch(`http://127.0.0.1:8000/api/inventory/products/${product.id}/`, { variants: JSON.stringify(updatedVariants) });
      fetchData(); if (updatedVariants.length <= 1) setExpandedProductId(null);
    } catch (error) { alert("Failed to delete size variant."); }
  };

  const handleStandaloneCreateCategory = async (e) => {
    e.preventDefault();
    if (!standaloneCategoryName.trim()) return;
    setIsSubmittingCategory(true);
    try {
      const generatedSlug = standaloneCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      await axios.post('http://127.0.0.1:8000/api/inventory/categories/', { name: standaloneCategoryName, slug: generatedSlug });
      fetchData(); setStandaloneCategoryName(""); setIsAddCategoryModalOpen(false);
    } catch (error) { alert("Failed to create category."); } finally { setIsSubmittingCategory(false); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsAddingCategory(true);
    try {
      const generatedSlug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const res = await axios.post('http://127.0.0.1:8000/api/inventory/categories/', { name: newCategoryName, slug: generatedSlug });
      setCategories(prev => [...prev, res.data]); setFormData(prev => ({ ...prev, category: res.data.id }));
      setNewCategoryName(""); setShowCategoryInput(false);
    } catch (error) { alert("Failed to create category."); } finally { setIsAddingCategory(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.variants.length === 0) { alert("Please add at least one product size/variant."); return; }

    setIsSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name); data.append('description', formData.description || ''); 
    data.append('is_active', formData.is_active);
    if (formData.category) data.append('category_id', formData.category); 
    if (formData.image) data.append('image', formData.image);
    
    const cleanedVariants = formData.variants.map(v => {
      const price = parseFloat(v.price) || 0;
      let calculatedDiscount = '';
      if (v._showDiscount && v.discount_percentage) calculatedDiscount = price - (price * (parseFloat(v.discount_percentage) / 100));
      let calculatedBulk = '';
      if (v._showBulk && v.bulk_percentage) calculatedBulk = price - (price * (parseFloat(v.bulk_percentage) / 100));

      return {
        unit_size: v.unit_size, price: v.price, stock_quantity: v.stock_quantity, reorder_level: v.reorder_level,
        discount_price: calculatedDiscount, bulk_threshold: v._showBulk ? v.bulk_threshold : '', bulk_price: calculatedBulk
      };
    });

    data.append('variants', JSON.stringify(cleanedVariants));

    try {
      if (isEditMode && editingProductId) {
        await axios.patch(`http://127.0.0.1:8000/api/inventory/products/${editingProductId}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('http://127.0.0.1:8000/api/inventory/products/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      fetchData(); setIsDrawerOpen(false); setFormData(initialFormState); setImagePreview(null);
    } catch (error) { alert(`Failed to save product.`); } finally { setIsSubmitting(false); }
  };

  const openRestockModal = (product, variantIndex = 0) => { setSelectedProduct(product); setRestockAmount(""); setRestockVariantIndex(variantIndex); setIsRestockModalOpen(true); };
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockAmount || isNaN(restockAmount)) return;
    setIsRestocking(true);
    try {
      const updatedVariants = selectedProduct.variants.map((v, index) => {
        if (index === restockVariantIndex) return { ...v, stock_quantity: parseInt(v.stock_quantity || 0) + parseInt(restockAmount) };
        return v; 
      });
      await axios.patch(`http://127.0.0.1:8000/api/inventory/products/${selectedProduct.id}/`, { variants: JSON.stringify(updatedVariants) });
      fetchData(); setIsRestockModalOpen(false); setSelectedProduct(null);
    } catch (error) { alert("Failed to update stock."); } finally { setIsRestocking(false); }
  };

  // ─── FILTERS ───
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const { variantDetails } = getProductDisplayInfo(item);
    
    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = variantDetails.some(vs => vs.filterVal === 'low');
    if (stockFilter === 'out') matchesStock = variantDetails.some(vs => vs.filterVal === 'out');

    return matchesSearch && matchesStock;
  });
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(categorySearchTerm.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20">
      
      {/* ─── HEADER & TABS ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-gray-200 dark:border-white/10 pb-6 transition-colors">
        <div>
          <h2 className="text-[clamp(2rem,3vw,3rem)] font-bold text-[#0F2318] dark:text-[#F5EDD8] leading-[1.1]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Inventory Management
          </h2>
          <div className="flex gap-6 mt-4">
            <button onClick={() => setActiveTab('products')} className={`pb-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'products' ? 'border-[#2D6A27] dark:border-[#7DC57A] text-[#2D6A27] dark:text-[#7DC57A]' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>Products ({inventory.length})</button>
            <button onClick={() => setActiveTab('categories')} className={`pb-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'categories' ? 'border-[#2D6A27] dark:border-[#7DC57A] text-[#2D6A27] dark:text-[#7DC57A]' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>Categories ({categories.length})</button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'products' ? (
            <>
              <div className="relative hidden lg:block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg><input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 text-sm rounded-full pl-10 pr-4 py-2.5 outline-none focus:border-[#7DC57A] dark:text-white w-48 transition-colors" /></div>
              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 text-sm font-medium rounded-full px-4 py-2.5 outline-none focus:border-[#7DC57A] dark:text-white transition-colors appearance-none cursor-pointer"><option value="all">All Stock</option><option value="low">Low Stock</option><option value="out">Out of Stock</option></select>
              <button onClick={() => setIsAddCategoryModalOpen(true)} className="text-sm font-bold px-5 py-2.5 rounded-full transition-all bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm">Add Category</button>
              <button onClick={openAddDrawer} className="text-sm font-bold px-6 py-2.5 rounded-full transition-all bg-[#0F2318] dark:bg-[#7DC57A] text-white dark:text-[#0F2318] hover:bg-[#1A2E18] dark:hover:bg-white flex items-center gap-2 shadow-lg">Add Product <span>+</span></button>
            </>
          ) : (
            <>
              <div className="relative"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg><input type="text" placeholder="Search categories..." value={categorySearchTerm} onChange={(e) => setCategorySearchTerm(e.target.value)} className="bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 text-sm rounded-full pl-10 pr-4 py-2.5 outline-none focus:border-[#7DC57A] dark:text-white w-56 transition-colors" /></div>
              <button onClick={() => setIsAddCategoryModalOpen(true)} className="text-sm font-bold px-6 py-2.5 rounded-full transition-all bg-[#0F2318] dark:bg-[#7DC57A] text-white dark:text-[#0F2318] hover:bg-[#1A2E18] dark:hover:bg-white shadow-lg flex items-center gap-2">Add Category <span>+</span></button>
            </>
          )}
        </div>
      </div>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm transition-colors">
        
        {/* PRODUCTS VIEW */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F7F3] dark:bg-[#0F2318]/50 border-b border-gray-200 dark:border-white/10">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Name</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="py-12 text-center"><div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#2D6A27] dark:border-[#7DC57A] animate-spin mx-auto"></div></td></tr>
                ) : filteredInventory.length === 0 ? (
                  <tr><td colSpan="6" className="py-12 text-center text-gray-500 dark:text-gray-400">No products match your search or filters.</td></tr>
                ) : (
                  filteredInventory.map((item) => {
                    const { count, variantDetails } = getProductDisplayInfo(item);
                    const isExpanded = expandedProductId === item.id;

                    return (
                      <Fragment key={item.id}>
                        {/* MAIN ROW */}
                        <tr 
                          onClick={() => setExpandedProductId(isExpanded ? null : item.id)}
                          className={`group transition-all duration-300 cursor-pointer ${isExpanded ? 'bg-gray-50/50 dark:bg-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'} ${!item.is_active ? 'opacity-50 grayscale' : ''}`}
                        >
                          <td className="py-4 px-6 flex items-start gap-4">
                            <img src={item.image || "https://via.placeholder.com/40"} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-[#0F2318]" />
                            <div className="flex flex-col justify-center h-12">
                              <span className="font-bold text-gray-900 dark:text-[#F5EDD8] block leading-tight text-base">{item.name}</span>
                              <div className="text-[10px] text-[#C4892A] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:text-[#E0A83A] transition-colors mt-1.5">
                                {count > 1 ? `${count} Sizes Available` : 'View Details'}
                                <motion.svg animate={{ rotate: isExpanded ? 180 : 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></motion.svg>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 align-top pt-5">
                            {item.category?.name || item.category || 'Uncategorized'}
                          </td>
                          
                          <td className="py-4 px-6 align-top">
                            <div className="flex flex-col">
                              {variantDetails.map((vd, idx) => (
                                <div key={idx} className={`py-1.5 flex items-center ${idx !== count - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''} min-h-[44px]`}>
                                  <span className="text-sm text-gray-900 dark:text-[#F5EDD8] font-medium whitespace-nowrap">
                                    {count > 1 && <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-2">{vd.unit_size}:</span>}
                                    KES {vd.priceFormatted}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          
                          <td className="py-4 px-6 align-top">
                            <div className="flex flex-col w-full">
                              {variantDetails.map((vd, idx) => (
                                <div key={idx} className={`py-1.5 flex items-center ${idx !== count - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''} min-h-[44px]`}>
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap ${vd.color}`}>
                                    {count > 1 ? `${vd.unit_size}: ` : ''}{vd.stock} - {vd.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* DEDICATED PER-VARIANT ACTIONS COLUMN */}
                          <td className="py-4 px-6 align-top">
                            <div className="flex flex-col">
                              {variantDetails.map((vd, idx) => (
                                <div key={idx} className={`py-1.5 flex items-center ${idx !== count - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''} min-h-[44px]`}>
                                  <div className="flex items-center gap-3 bg-white dark:bg-[#0F2318] p-1.5 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm" onClick={e => e.stopPropagation()}>
                                    
                                    <div className="flex items-center gap-1.5 cursor-pointer group/toggle" title={vd.hasDiscount ? "Remove Discount" : "Add Discount"} onClick={(e) => handleToggleOffer(e, item, idx, 'discount', vd.hasDiscount)}>
                                      <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${vd.hasDiscount ? 'text-[#C4892A]' : 'text-gray-400 group-hover/toggle:text-gray-600 dark:group-hover/toggle:text-gray-300'}`}>Disc.</span>
                                      <button className={`relative inline-flex h-3.5 w-6 items-center rounded-full transition-colors focus:outline-none pointer-events-none ${vd.hasDiscount ? 'bg-[#C4892A]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${vd.hasDiscount ? 'translate-x-3' : 'translate-x-1'}`} />
                                      </button>
                                    </div>

                                    <div className="w-px h-3.5 bg-gray-200 dark:bg-gray-700"></div>

                                    <div className="flex items-center gap-1.5 cursor-pointer group/toggle" title={vd.hasBulkOffer ? "Remove Bulk Offer" : "Add Bulk Offer"} onClick={(e) => handleToggleOffer(e, item, idx, 'bulk', vd.hasBulkOffer)}>
                                      <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${vd.hasBulkOffer ? 'text-[#7DC57A]' : 'text-gray-400 group-hover/toggle:text-gray-600 dark:group-hover/toggle:text-gray-300'}`}>Bulk</span>
                                      <button className={`relative inline-flex h-3.5 w-6 items-center rounded-full transition-colors focus:outline-none pointer-events-none ${vd.hasBulkOffer ? 'bg-[#7DC57A]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${vd.hasBulkOffer ? 'translate-x-3' : 'translate-x-1'}`} />
                                      </button>
                                    </div>

                                    <div className="w-px h-3.5 bg-gray-200 dark:bg-gray-700"></div>

                                    <button onClick={(e) => { e.stopPropagation(); openRestockModal(item, idx); }} className="text-[10px] font-bold text-[#2D6A27] dark:text-[#7DC57A] hover:bg-[#2D6A27]/10 dark:hover:bg-[#7DC57A]/10 transition-colors px-2 py-0.5 rounded-md whitespace-nowrap">
                                      Restock
                                    </button>

                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right align-top pt-5">
                            <div className="flex items-center justify-end gap-3">
                              
                              <div className="flex items-center gap-2 mr-2" title={item.is_active ? "Product is visible" : "Product is hidden"}>
                                <button onClick={(e) => toggleProductActive(e, item)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${item.is_active ? 'bg-[#2D6A27] dark:bg-[#7DC57A]' : 'bg-gray-300 dark:bg-gray-600'}`}><span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${item.is_active ? 'translate-x-5' : 'translate-x-1'}`} /></button>
                              </div>

                              {/* Settings Gear Dropdown */}
                              <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setActiveSettingsId(activeSettingsId === item.id ? null : item.id); }} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </button>
                                
                                <AnimatePresence>
                                  {activeSettingsId === item.id && (
                                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }} className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                                      <button onClick={(e) => { e.stopPropagation(); setActiveSettingsId(null); openEditDrawer(item); }} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> Edit</button>
                                      <button onClick={(e) => { e.stopPropagation(); setActiveSettingsId(null); deleteProduct(e, item.id); }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Delete</button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDABLE VARIANT DATA WITH BADGES */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan="6" className="p-0 border-b border-gray-100 dark:border-white/5">
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50/80 dark:bg-[#0A1810]/80 shadow-[inset_0_4px_6px_-6px_rgba(0,0,0,0.1)]">
                                  <div className="p-6 md:pl-[4.5rem]">
                                    <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Detailed Size Options</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {variantDetails.map((vd, idx) => (
                                        <div key={idx} className="bg-white dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm relative group/card">
                                          <button onClick={(e) => handleDeleteVariant(e, item, idx)} className="absolute top-4 right-4 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Delete this size"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                          
                                          <div className="flex justify-between items-start pr-8 mb-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="font-bold text-gray-900 dark:text-[#F5EDD8] text-lg leading-none">{vd.unit_size || 'Base Variant'}</span>
                                              {vd.variantBadges.map((b, i) => (
                                                <span key={i} className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                                                  {b}
                                                </span>
                                              ))}
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${vd.color}`}>{vd.stock} in stock</div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                            <div className="flex flex-col"><span className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Price</span><span className="text-gray-900 dark:text-white font-medium text-sm">KES {vd.priceFormatted}</span></div>
                                            <div className="flex flex-col"><span className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Reorder Level</span><span className="text-gray-900 dark:text-white font-medium text-sm">{vd.reorder_level || '-'}</span></div>
                                            <div className="flex flex-col"><span className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Discount Price</span><span className="text-gray-900 dark:text-white font-medium text-sm">{vd.discountFormatted}</span></div>
                                            <div className="flex flex-col"><span className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Bulk Threshold</span><span className="text-gray-900 dark:text-white font-medium text-sm">{vd.bulk_threshold ? `${vd.bulk_threshold} units` : '-'}</span></div>
                                            {vd.bulkFormatted !== '-' && (
                                              <div className="flex flex-col col-span-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg"><span className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Bulk Price</span><span className="text-gray-900 dark:text-[#7DC57A] font-bold text-sm">{vd.bulkFormatted}</span></div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* CATEGORIES VIEW */}
        {activeTab === 'categories' && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredCategories.map(cat => (
                <div key={cat.id} className="bg-gray-50 dark:bg-[#0F2318]/50 border border-gray-200 dark:border-white/10 rounded-2xl p-5 flex justify-between items-center group transition-all hover:border-[#2D6A27] dark:hover:border-[#7DC57A]">
                  <div><h4 className="font-bold text-gray-900 dark:text-[#F5EDD8] text-lg">{cat.name}</h4><p className="text-xs text-gray-500 mt-1">Slug: {cat.slug}</p></div>
                  <button onClick={() => deleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Delete Category"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── ADD/EDIT PRODUCT DRAWER ─── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-[#0F2318]/40 dark:bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#0A1810] border-l border-gray-200 dark:border-white/10 z-[70] shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10"><h3 className="text-xl font-bold text-gray-900 dark:text-[#F5EDD8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{isEditMode ? 'Edit Product' : 'Add New Product'}</h3><button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 rounded-full transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
              <div className="flex-1 overflow-y-auto"><form id="productForm" onSubmit={handleSubmit} className="p-6 space-y-6">
                <label className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-2xl flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative overflow-hidden">{imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" /> : <><span className="text-3xl mb-2">📸</span><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upload product image</p></>}<input type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></label>
                <div className="flex items-center gap-3 mb-2"><input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="w-4 h-4 text-[#7DC57A] bg-gray-100 border-gray-300 rounded focus:ring-[#7DC57A] dark:bg-[#0F2318] dark:border-white/20"/><label htmlFor="is_active" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">Product is Active</label></div>
                <div className="space-y-4"><div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Name</label><input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-white dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7DC57A] transition-colors" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label><select required name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-white dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7DC57A] transition-colors appearance-none"><option value="">Select Category</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option> )}</select></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-white dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7DC57A] transition-colors resize-none"></textarea></div></div>
                <div className="w-full h-px bg-gray-200 dark:bg-white/10 my-8 relative"><span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-white dark:bg-[#0A1810] px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Variant Settings</span></div>
                <div className="space-y-6">{formData.variants.map((variant, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl relative"><div className="flex justify-between items-center mb-4"><span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size Option {index + 1}</span>{formData.variants.length > 1 && (<button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-700 transition-colors p-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>)}</div>
                  
                  {/* SLEEK TOGGLES FOR OFFERS */}
                  <div className="flex flex-wrap gap-6 mb-5 pb-4 border-b border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleVariantOffer(index, '_showDiscount', variant._showDiscount)}>
                      <button type="button" className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${variant._showDiscount ? 'bg-[#C4892A]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${variant._showDiscount ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                      <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${variant._showDiscount ? 'text-[#C4892A]' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>Enable Discount</span>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleVariantOffer(index, '_showBulk', variant._showBulk)}>
                      <button type="button" className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${variant._showBulk ? 'bg-[#7DC57A]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${variant._showBulk ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                      <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${variant._showBulk ? 'text-[#7DC57A]' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>Enable Bulk Pricing</span>
                    </div>
                  </div>

                  <div className="space-y-4"><div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Unit Size (e.g. 500ml, 1kg)</label><input required type="text" name="unit_size" value={variant.unit_size} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-white dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7DC57A]" /></div>
                  <div className="grid grid-cols-2 gap-3"><div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Base Price (KES)</label><input required type="number" name="price" value={variant.price} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-white dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7DC57A]" /></div><div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Stock Qty</label><input required type="number" name="stock_quantity" value={variant.stock_quantity} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-white dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7DC57A]" /></div></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Reorder Level Alert (Default: 10)</label><input type="number" name="reorder_level" value={variant.reorder_level} onChange={(e) => handleVariantChange(index, e)} placeholder="10" className="w-full bg-white dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7DC57A]" /></div>
                  {variant._showDiscount && (<div className="flex flex-col gap-1.5 p-3 bg-[#C4892A]/5 dark:bg-[#C4892A]/10 rounded-lg border border-[#C4892A]/20"><label className="text-[10px] font-bold text-[#C4892A] uppercase">Discount Percentage (%)</label><input type="number" min="1" max="99" name="discount_percentage" value={variant.discount_percentage} onChange={(e) => handleVariantChange(index, e)} placeholder="e.g. 10 for 10% off" className="w-full bg-white dark:bg-[#0F2318] border border-[#C4892A]/30 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#C4892A]" /></div>)}
                  {variant._showBulk && (<div className="grid grid-cols-2 gap-3 p-3 bg-[#7DC57A]/5 dark:bg-[#7DC57A]/10 rounded-lg border border-[#7DC57A]/20"><div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-[#2D6A27] dark:text-[#7DC57A] uppercase">Bulk Threshold</label><input type="number" name="bulk_threshold" value={variant.bulk_threshold} onChange={(e) => handleVariantChange(index, e)} placeholder="e.g. 5 units" className="w-full bg-white dark:bg-[#0F2318] border border-[#7DC57A]/30 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7DC57A]" /></div><div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-[#2D6A27] dark:text-[#7DC57A] uppercase">Bulk Discount (%)</label><input type="number" min="1" max="99" name="bulk_percentage" value={variant.bulk_percentage} onChange={(e) => handleVariantChange(index, e)} placeholder="e.g. 15 for 15% off" className="w-full bg-white dark:bg-[#0F2318] border border-[#7DC57A]/30 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7DC57A]" /></div></div>)}</div></div>
                ))}
                <button type="button" onClick={addVariant} className="w-full border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[#2D6A27] hover:border-[#2D6A27] dark:hover:text-[#7DC57A] transition-colors flex justify-center items-center gap-2"><span>+</span> Add Another Size Option</button></div></form></div>
              <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A1810]"><button type="submit" form="productForm" disabled={isSubmitting} className="w-full bg-[#0F2318] dark:bg-[#7DC57A] text-white dark:text-[#0F2318] font-bold py-3.5 rounded-xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">{isSubmitting ? 'Saving...' : (isEditMode ? 'Update Product' : 'Save Product')}</button></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MODALS ─── */}
      <AnimatePresence>{isAddCategoryModalOpen && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddCategoryModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]" /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl z-[90] p-6"><h3 className="text-xl font-bold mb-4 dark:text-white">Add Category</h3><form onSubmit={handleStandaloneCreateCategory} className="space-y-4"><input type="text" required placeholder="Name" value={standaloneCategoryName} onChange={(e) => setStandaloneCategoryName(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-[#7DC57A] outline-none" /><button type="submit" disabled={isSubmittingCategory} className="w-full bg-[#0F2318] dark:bg-[#7DC57A] text-white dark:text-[#0F2318] font-bold py-3 rounded-xl">{isSubmittingCategory ? 'Saving...' : 'Create'}</button></form></motion.div></>)}</AnimatePresence>
      <AnimatePresence>{isRestockModalOpen && selectedProduct && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRestockModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]" /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-[#0A1810] border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl z-[90] p-6"><h3 className="text-xl font-bold mb-4 dark:text-white">Restock: {selectedProduct.name}</h3><form onSubmit={handleRestockSubmit} className="space-y-4">{selectedProduct.variants?.length > 1 && (<select value={restockVariantIndex} onChange={(e) => setRestockVariantIndex(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-[#7DC57A] outline-none appearance-none">{selectedProduct.variants.map((v, i) => <option key={i} value={i}>{v.unit_size} (Current: {v.stock_quantity})</option>)}</select>)}<input type="number" required min="1" placeholder="Add Quantity" value={restockAmount} onChange={(e) => setRestockAmount(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0F2318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-[#7DC57A] outline-none" /><button type="submit" disabled={isRestocking} className="w-full bg-[#0F2318] dark:bg-[#7DC57A] text-white dark:text-[#0F2318] font-bold py-3 rounded-xl">{isRestocking ? 'Updating...' : 'Restock'}</button></form></motion.div></>)}</AnimatePresence>
    </motion.div>
  );
}