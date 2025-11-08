import React, { useState, useEffect } from 'react';
import { Truck, Users, Package, DollarSign, MapPin, Trash2, Edit2, Plus, Mail, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from './supabaseClient';

const FreightForwarderApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // State for master data
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [transportTypes, setTransportTypes] = useState([]);
  const [originLocations, setOriginLocations] = useState([]);
  const [destinationLocations, setDestinationLocations] = useState([]);

  // State for partners
  const [partners, setPartners] = useState([]);

  // State for customers
  const [customers, setCustomers] = useState([]);

  // State for projects
  const [projects, setProjects] = useState([]);

  // State for price database
  const [prices, setPrices] = useState([]);

  // Dashboard filters
  const [dashboardDateRange, setDashboardDateRange] = useState({ start: '', end: '' });

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [vTypes, tTypes, origins, destinations, partnersData, customersData, projectsData, pricesData] = await Promise.all([
        supabase.from('vehicle_types').select('*'),
        supabase.from('transport_types').select('*'),
        supabase.from('origin_locations').select('*'),
        supabase.from('destination_locations').select('*'),
        supabase.from('partners').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('prices').select('*')
      ]);

      setVehicleTypes(vTypes.data || []);
      setTransportTypes(tTypes.data || []);
      setOriginLocations(origins.data || []);
      setDestinationLocations(destinations.data || []);
      setPartners(partnersData.data || []);
      setCustomers(customersData.data || []);
      setProjects(projectsData.data || []);
      setPrices(pricesData.data || []);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veri yüklenirken hata oluştu. Lütfen Supabase bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (action) => {
    setDeleteAction(() => action);
    setShowDeleteModal(true);
  };

  const executeDelete = () => {
    if (deleteAction) deleteAction();
    setShowDeleteModal(false);
    setDeleteAction(null);
  };

  // Master Data Component
  const MasterData = () => {
    const [newItem, setNewItem] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [selectedType, setSelectedType] = useState('vehicle');

    const tabs = [
      { id: 'vehicle', label: 'Araç Tipi' },
      { id: 'transport', label: 'Nakliye Tipi' },
      { id: 'origin', label: 'Çıkış Lokasyonu' },
      { id: 'destination', label: 'Varış Lokasyonu' }
    ];

    const getTableName = () => {
      switch (selectedType) {
        case 'vehicle': return 'vehicle_types';
        case 'transport': return 'transport_types';
        case 'origin': return 'origin_locations';
        case 'destination': return 'destination_locations';
        default: return '';
      }
    };

    const getCurrentList = () => {
      switch (selectedType) {
        case 'vehicle': return vehicleTypes;
        case 'transport': return transportTypes;
        case 'origin': return originLocations;
        case 'destination': return destinationLocations;
        default: return [];
      }
    };

    const refreshData = async () => {
      const tableName = getTableName();
      const { data } = await supabase.from(tableName).select('*');

      switch (selectedType) {
        case 'vehicle': setVehicleTypes(data || []); break;
        case 'transport': setTransportTypes(data || []); break;
        case 'origin': setOriginLocations(data || []); break;
        case 'destination': setDestinationLocations(data || []); break;
      }
    };

    const addItem = async () => {
      if (!newItem.trim()) return;

      const tableName = getTableName();
      const { error } = await supabase
        .from(tableName)
        .insert([{ name: newItem }]);

      if (error) {
        console.error('Ekleme hatası:', error);
        alert('Kayıt eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      setNewItem('');
      await refreshData();
    };

    const startEdit = (item) => {
      setEditingId(item.id);
      setEditValue(item.name);
    };

    const saveEdit = async () => {
      const tableName = getTableName();
      const { error } = await supabase
        .from(tableName)
        .update({ name: editValue })
        .eq('id', editingId);

      if (error) {
        console.error('Güncelleme hatası:', error);
        alert('Kayıt güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      setEditingId(null);
      setEditValue('');
      await refreshData();
    };

    const deleteItem = async (id) => {
      const tableName = getTableName();
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Silme hatası:', error);
        alert('Kayıt silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      await refreshData();
    };

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Temel Tanımlar</h2>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-4" role="tablist">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  selectedType === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                role="tab"
                aria-selected={selectedType === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Yeni ekle..."
            className="flex-1 px-4 py-2 border rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
          />
          <button onClick={addItem} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} /> Ekle
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">İsim</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentList().map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-2 py-1 border rounded"
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === item.id ? (
                      <button onClick={saveEdit} className="text-green-600 hover:text-green-800 mr-3">Kaydet</button>
                    ) : (
                      <button onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3">
                        <Edit2 size={18} />
                      </button>
                    )}
                    <button onClick={() => confirmDelete(() => deleteItem(item.id))} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Partners Component
  const Partners = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [formData, setFormData] = useState({
      company_name: '',
      company_details: '',
      contact_name: '',
      contact_email: '',
      routes: [],
      selected_partners: [],
      request_text: ''
    });

    const resetForm = () => {
      setFormData({
        company_name: '',
        company_details: '',
        contact_name: '',
        contact_email: '',
        routes: [],
        selected_partners: [],
        request_text: ''
      });
      setEditingPartner(null);
      setShowForm(false);
    };

    const refreshPartners = async () => {
      const { data } = await supabase.from('partners').select('*');
      setPartners(data || []);
    };

    const handleSubmit = async () => {
      if (editingPartner) {
        const { error } = await supabase
          .from('partners')
          .update(formData)
          .eq('id', editingPartner.id);

        if (error) {
          console.error('Güncelleme hatası:', error);
          alert('Partner güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
          return;
        }
        alert('Partner başarıyla güncellendi!');
      } else {
        const { error } = await supabase
          .from('partners')
          .insert([formData]);

        if (error) {
          console.error('Ekleme hatası:', error);
          alert('Partner eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
          return;
        }
        alert('Partner başarıyla eklendi!');
      }

      resetForm();
      await refreshPartners();
    };

    const startEditPartner = (partner) => {
      setFormData(partner);
      setEditingPartner(partner);
      setShowForm(true);
    };

    const deletePartner = async (id) => {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Silme hatası:', error);
        alert('Partner silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      alert('Partner başarıyla silindi!');
      await refreshPartners();
    };

    const addRoute = () => {
      setFormData({
        ...formData,
        routes: [...formData.routes, { origin: '', destination: '' }]
      });
    };

    const updateRoute = (index, field, value) => {
      const newRoutes = [...formData.routes];
      newRoutes[index][field] = value;
      setFormData({ ...formData, routes: newRoutes });
    };

    const removeRoute = (index) => {
      setFormData({
        ...formData,
        routes: formData.routes.filter((_, i) => i !== index)
      });
    };

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Partnerler</h2>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} /> Yeni Partner
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingPartner ? `Partner Düzenle - ${editingPartner.company_name}` : 'Yeni Partner'}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Şirket İsmi"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Kontak Kişi"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Kontak Email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Şirket Detayları"
                value={formData.company_details}
                onChange={(e) => setFormData({ ...formData, company_details: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Güzergahlar</h4>
                <button onClick={addRoute} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <Plus size={16} /> Güzergah Ekle
                </button>
              </div>
              {formData.routes.map((route, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={route.origin}
                    onChange={(e) => updateRoute(index, 'origin', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  >
                    <option value="">Çıkış Seç</option>
                    {originLocations.map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                  <span className="flex items-center">→</span>
                  <select
                    value={route.destination}
                    onChange={(e) => updateRoute(index, 'destination', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  >
                    <option value="">Varış Seç</option>
                    {destinationLocations.map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                  <button onClick={() => removeRoute(index)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Kaydet
              </button>
              <button onClick={resetForm} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                İptal
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Şirket</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kontak</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Güzergahlar</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {partners.map(partner => (
                <tr key={partner.id}>
                  <td className="px-6 py-4">{partner.company_name}</td>
                  <td className="px-6 py-4">{partner.contact_name}</td>
                  <td className="px-6 py-4">{partner.contact_email}</td>
                  <td className="px-6 py-4">
                    {partner.routes && partner.routes.map((r, i) => (
                      <div key={i} className="text-sm">{r.origin} → {r.destination}</div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => startEditPartner(partner)} className="text-blue-600 hover:text-blue-800 mr-3">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => confirmDelete(() => deletePartner(partner.id))} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Projects Component
  const Projects = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
      title: '',
      details: '',
      origin: '',
      destination: '',
      status: 'yeni',
      loss_reason: '',
      selected_partners: [],
      request_text: ''
    });

    const generateProjectId = () => {
      return 'PRJ-' + Date.now();
    };

    const resetForm = () => {
      setFormData({
        title: '',
        details: '',
        origin: '',
        destination: '',
        status: 'yeni',
        loss_reason: '',
        selected_partners: [],
        request_text: ''
      });
      setEditingProject(null);
      setShowForm(false);
    };

    const refreshProjects = async () => {
      const { data } = await supabase.from('projects').select('*');
      setProjects(data || []);
    };

    const handleSubmitProject = async () => {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', editingProject.id);

        if (error) {
          console.error('Güncelleme hatası:', error);
          alert('Proje güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
          return;
        }
        alert('Proje başarıyla güncellendi!');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([{ ...formData, project_id: generateProjectId() }]);

        if (error) {
          console.error('Ekleme hatası:', error);
          alert('Proje eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
          return;
        }
        alert('Proje başarıyla eklendi!');
      }

      resetForm();
      await refreshProjects();
    };

    const startEditProject = (project) => {
      setFormData(project);
      setEditingProject(project);
      setShowForm(true);
    };

    const deleteProject = async (id) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Silme hatası:', error);
        alert('Proje silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      alert('Proje başarıyla silindi!');
      await refreshProjects();
    };

    const updatePartnerPrice = async (projectId, partnerId, price) => {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedPartners = project.selected_partners.map(p =>
        p.id === partnerId ? { ...p, price: price } : p
      );

      const { error } = await supabase
        .from('projects')
        .update({ selected_partners: updatedPartners })
        .eq('id', projectId);

      if (error) {
        console.error('Fiyat güncelleme hatası:', error);
        alert('Partner fiyatı güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      await refreshProjects();
    };

    const togglePartnerSelect = (partnerId) => {
      const partner = partners.find(p => p.id === partnerId);
      const isSelected = formData.selected_partners.some(p => p.id === partnerId);

      if (isSelected) {
        setFormData({
          ...formData,
          selected_partners: formData.selected_partners.filter(p => p.id !== partnerId)
        });
      } else {
        setFormData({
          ...formData,
          selected_partners: [...formData.selected_partners, { ...partner, price: '' }]
        });
      }
    };

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Proje Yönetimi</h2>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} /> Yeni Proje
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">{editingProject ? 'Proje Düzenle' : 'Yeni Proje'}</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Proje Başlığı"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 border rounded-lg col-span-2"
              />
              <textarea
                placeholder="Proje Detayları"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="px-4 py-2 border rounded-lg col-span-2"
                rows="3"
              />
              <select
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Çıkış Lokasyonu Seç</option>
                {originLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
              <select
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Varış Lokasyonu Seç</option>
                {destinationLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>

              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="yeni">Yeni</option>
                <option value="fiyatlandırma">Fiyatlandırma</option>
                <option value="kazanıldı">Kazanıldı</option>
                <option value="kaybedildi">Kaybedildi</option>
              </select>

              {formData.status === 'kaybedildi' && (
                <select
                  value={formData.loss_reason}
                  onChange={(e) => setFormData({ ...formData, loss_reason: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">Kayıp Nedeni Seç</option>
                  <option value="fiyat-yuksek">Fiyat Yüksek</option>
                  <option value="musteri-iptali">Müşteri İptali</option>
                  <option value="gec-donus">Geç Dönüş Yapıldı</option>
                  <option value="diger">Diğer</option>
                </select>
              )}
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Partner Seçimi</h4>
              <div className="grid grid-cols-2 gap-2">
                {partners.map(partner => (
                  <label key={partner.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.selected_partners.some(p => p.id === partner.id)}
                      onChange={() => togglePartnerSelect(partner.id)}
                    />
                    <span>{partner.company_name}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.selected_partners.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Talep Metni</h4>
                <textarea
                  value={formData.request_text}
                  onChange={(e) => setFormData({ ...formData, request_text: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="4"
                  placeholder="Partnerlere gönderilecek talep metnini yazın..."
                />
                <button 
                  onClick={() => alert('Talep emaili gönderildi!')}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Mail size={18} /> Talep Gönder
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={handleSubmitProject} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Kaydet
              </button>
              <button onClick={resetForm} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                İptal
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{project.title}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{project.project_id}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{project.details}</p>
                  <p className="text-sm text-gray-500">
                    <MapPin size={16} className="inline mr-1" />
                    {project.origin} → {project.destination}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditProject(project)} className="text-blue-600 hover:text-blue-800">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => confirmDelete(() => deleteProject(project.id))} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  project.status === 'yeni' ? 'bg-gray-200' :
                  project.status === 'fiyatlandırma' ? 'bg-yellow-200' :
                  project.status === 'kazanıldı' ? 'bg-green-200' :
                  'bg-red-200'
                }`}>
                  Durum: {project.status}
                </span>
                {project.status === 'kaybedildi' && project.loss_reason && (
                  <span className="ml-2 text-sm text-gray-600">Neden: {project.loss_reason}</span>
                )}
              </div>

              {project.selected_partners && project.selected_partners.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Seçili Partnerler ve Fiyatlar</h4>
                  <div className="space-y-2">
                    {project.selected_partners.map(partner => (
                      <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span>{partner.company_name}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Fiyat"
                            value={partner.price || ''}
                            onChange={(e) => updatePartnerPrice(project.id, partner.id, e.target.value)}
                            className="w-32 px-3 py-1 border rounded"
                          />
                          <span>€</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Customers Component
  const Customers = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [showCsvImport, setShowCsvImport] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [importProgress, setImportProgress] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
      name: '',
      country: '',
      city: '',
      email: ''
    });
    const [formData, setFormData] = useState({
      name: '',
      street: '',
      street2: '',
      zip: '',
      country: '',
      city: '',
      phone: '',
      email: ''
    });

    const itemsPerPage = 50;

    const resetForm = () => {
      setFormData({
        name: '',
        street: '',
        street2: '',
        zip: '',
        country: '',
        city: '',
        phone: '',
        email: ''
      });
      setEditingCustomer(null);
      setShowForm(false);
    };

    const refreshCustomers = async () => {
      const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      setCustomers(data || []);
    };

    const validateForm = () => {
      if (!formData.name?.trim()) {
        alert('Şirket İsmi zorunludur.');
        return false;
      }
      if (!formData.street?.trim()) {
        alert('Adres zorunludur.');
        return false;
      }
      if (!formData.country?.trim()) {
        alert('Ülke zorunludur.');
        return false;
      }
      if (!formData.city?.trim()) {
        alert('Şehir zorunludur.');
        return false;
      }
      if (!formData.email?.trim()) {
        alert('E-mail zorunludur.');
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Geçerli bir e-mail adresi giriniz.');
        return false;
      }

      return true;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;

      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', editingCustomer.id);

        if (error) {
          console.error('Güncelleme hatası:', error);
          alert('Müşteri güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
          return;
        }
        alert('Müşteri başarıyla güncellendi!');
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([formData]);

        if (error) {
          console.error('Ekleme hatası:', error);
          alert('Müşteri eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
          return;
        }
        alert('Müşteri başarıyla eklendi!');
      }

      resetForm();
      await refreshCustomers();
    };

    const startEditCustomer = (customer) => {
      setFormData(customer);
      setEditingCustomer(customer);
      setShowForm(true);
    };

    const deleteCustomer = async (id) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Silme hatası:', error);
        alert('Müşteri silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      alert('Müşteri başarıyla silindi!');
      await refreshCustomers();
    };

    // CSV Import Functions
    const parseCSV = (text) => {
      text = text.replace(/^\uFEFF/, '');
      
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) return [];

      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]);
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }

      return rows;
    };

    const validateAndConvertCSVRow = (row) => {
      const errors = [];
      
      if (!row.name) errors.push('Şirket ismi eksik');
      if (!row.street) errors.push('Adres eksik');
      if (!row.country) errors.push('Ülke eksik');
      if (!row.city) errors.push('Şehir eksik');
      if (!row.email) errors.push('E-mail eksik');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (row.email && !emailRegex.test(row.email.trim())) {
        errors.push('E-mail geçersiz format');
      }

      if (errors.length > 0) {
        return { success: false, errors };
      }

      return {
        success: true,
        data: {
          name: row.name.trim(),
          street: row.street.trim(),
          street2: row.street2?.trim() || null,
          zip: row.zip?.trim() || null,
          country: row.country.trim(),
          city: row.city.trim(),
          phone: row.phone?.trim() || null,
          email: row.email.trim()
        }
      };
    };

    const handleCsvImport = async () => {
      if (!csvFile) {
        alert('Lütfen bir CSV dosyası seçin.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          setImportProgress({ status: 'processing', message: 'CSV dosyası işleniyor...' });
          
          const text = e.target.result;
          const rows = parseCSV(text);
          
          if (rows.length === 0) {
            setImportProgress({ status: 'error', message: 'CSV dosyası boş veya geçersiz format.' });
            return;
          }

          const validRows = [];
          const invalidRows = [];

          rows.forEach((row, index) => {
            const result = validateAndConvertCSVRow(row);
            if (result.success) {
              validRows.push(result.data);
            } else {
              invalidRows.push({ row: index + 2, errors: result.errors });
            }
          });

          if (validRows.length === 0) {
            setImportProgress({ 
              status: 'error', 
              message: `Tüm satırlar geçersiz. ${invalidRows.length} hata bulundu.`,
              details: invalidRows 
            });
            return;
          }

          setImportProgress({ 
            status: 'importing', 
            message: `${validRows.length} kayıt veritabanına ekleniyor...` 
          });

          let successCount = 0;
          let failCount = 0;
          const dbErrors = [];

          for (let i = 0; i < validRows.length; i++) {
            try {
              const { error } = await supabase
                .from('customers')
                .insert([validRows[i]]);

              if (error) {
                failCount++;
                dbErrors.push({ row: i + invalidRows.length + 2, errors: [error.message] });
              } else {
                successCount++;
              }
            } catch (err) {
              failCount++;
              dbErrors.push({ row: i + invalidRows.length + 2, errors: [err.message] });
            }
          }

          await refreshCustomers();
          
          const allErrors = [...invalidRows, ...dbErrors];
          setImportProgress({ 
            status: successCount > 0 ? 'success' : 'error', 
            message: `${successCount} müşteri başarıyla eklendi.${failCount > 0 ? ` ${failCount} kayıt eklenemedi.` : ''}${invalidRows.length > 0 ? ` ${invalidRows.length} satır format hatası nedeniyle atlandı.` : ''}`,
            successCount: successCount,
            errorCount: allErrors.length,
            errors: allErrors
          });

          setCsvFile(null);
          setTimeout(() => {
            setShowCsvImport(false);
            setImportProgress(null);
          }, 5000);
        } catch (error) {
          console.error('CSV import hatası:', error);
          setImportProgress({ 
            status: 'error', 
            message: 'CSV işlenirken bir hata oluştu: ' + error.message 
          });
        }
      };

      reader.readAsText(csvFile);
    };

    // Filtering
    const getFilteredCustomers = () => {
      return customers.filter(customer => {
        if (filters.name && !customer.name?.toLowerCase().includes(filters.name.toLowerCase())) return false;
        if (filters.country && !customer.country?.toLowerCase().includes(filters.country.toLowerCase())) return false;
        if (filters.city && !customer.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
        if (filters.email && !customer.email?.toLowerCase().includes(filters.email.toLowerCase())) return false;
        return true;
      });
    };

    const resetFilters = () => {
      setFilters({
        name: '',
        country: '',
        city: '',
        email: ''
      });
      setCurrentPage(1);
    };

    // Pagination
    const filteredCustomers = getFilteredCustomers();
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 7;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Müşteriler</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowCsvImport(true)} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={20} /> CSV'den Toplu Ekle
            </button>
            <button 
              onClick={() => setShowForm(true)} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} /> Yeni Müşteri
            </button>
          </div>
        </div>

        {/* CSV Import Modal */}
        {showCsvImport && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">CSV'den Toplu Müşteri Ekle</h3>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>CSV Format:</strong> name, street, street2, zip, country, city, phone, email
              </p>
              <p className="text-sm text-blue-600">
                <strong>Zorunlu alanlar:</strong> name, street, country, city, email
              </p>
            </div>

            <div className="mb-4">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="px-4 py-2 border rounded-lg w-full"
              />
            </div>

            {importProgress && (
              <div className={`mb-4 p-4 rounded-lg ${
                importProgress.status === 'success' ? 'bg-green-50 text-green-800' :
                importProgress.status === 'error' ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
              }`}>
                <p className="font-semibold">{importProgress.message}</p>
                {importProgress.errors && importProgress.errors.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <p className="text-sm font-semibold">Hatalar:</p>
                    {importProgress.errors.map((error, idx) => (
                      <p key={idx} className="text-sm">
                        Satır {error.row}: {error.errors.join(', ')}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCsvImport}
                disabled={!csvFile || importProgress?.status === 'importing'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Import Başlat
              </button>
              <button
                onClick={() => {
                  setShowCsvImport(false);
                  setCsvFile(null);
                  setImportProgress(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Şirket İsmi *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-mail *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Adres *</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Adres Devamı</label>
                <input
                  type="text"
                  value={formData.street2}
                  onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ülke *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Şehir *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Posta Kodu</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingCustomer ? 'Güncelle' : 'Ekle'}
              </button>
              <button onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filtrele</h3>
          <div className="grid grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Şirket İsmi"
              value={filters.name}
              onChange={(e) => { setFilters({ ...filters, name: e.target.value }); setCurrentPage(1); }}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Ülke"
              value={filters.country}
              onChange={(e) => { setFilters({ ...filters, country: e.target.value }); setCurrentPage(1); }}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Şehir"
              value={filters.city}
              onChange={(e) => { setFilters({ ...filters, city: e.target.value }); setCurrentPage(1); }}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="E-mail"
              value={filters.email}
              onChange={(e) => { setFilters({ ...filters, email: e.target.value }); setCurrentPage(1); }}
              className="px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Toplam {filteredCustomers.length} müşteri bulundu
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
            >
              Filtreleri Sıfırla
            </button>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Şirket İsmi</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Adres</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ülke</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Şehir</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Posta Kodu</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Telefon</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">E-mail</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      Müşteri bulunamadı
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map(customer => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{customer.name}</td>
                      <td className="px-4 py-3 text-sm">
                        {customer.street}
                        {customer.street2 && <><br /><span className="text-gray-600">{customer.street2}</span></>}
                      </td>
                      <td className="px-4 py-3 text-sm">{customer.country}</td>
                      <td className="px-4 py-3 text-sm">{customer.city}</td>
                      <td className="px-4 py-3 text-sm">{customer.zip || '-'}</td>
                      <td className="px-4 py-3 text-sm">{customer.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm">{customer.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditCustomer(customer)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(() => deleteCustomer(customer.id))}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Sayfa {currentPage} / {totalPages} (Toplam {filteredCustomers.length} kayıt, {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCustomers.length)} arası gösteriliyor)
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                {getPageNumbers().map((page, idx) => (
                  page === '...' ? (
                    <span key={idx} className="px-3 py-1">...</span>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === page 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Price Database Component
  const PriceDatabase = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);
    const [showCsvImport, setShowCsvImport] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [importProgress, setImportProgress] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
      origin: '',
      destination: '',
      partner: '',
      transport_type: '',
      vehicle_type: '',
      price_min: '',
      price_max: ''
    });
    const [formData, setFormData] = useState({
      origin: '',
      destination: '',
      partner: '',
      transport_type: '',
      vehicle_type: '',
      price: '',
      weight: '',
      cbm: '',
      ldm: '',
      dimensions: '',
      valid_until: '',
      notes: ''
    });

    const resetForm = () => {
      setFormData({
        origin: '',
        destination: '',
        partner: '',
        transport_type: '',
        vehicle_type: '',
        price: '',
        weight: '',
        cbm: '',
        ldm: '',
        dimensions: '',
        valid_until: '',
        notes: ''
      });
      setEditingPrice(null);
      setShowForm(false);
    };

    const refreshPrices = async () => {
      const { data } = await supabase.from('prices').select('*');
      setPrices(data || []);
    };

    const handleSubmitPrice = async () => {
      // Zorunlu alan kontrolü
      if (!formData.origin || !formData.destination || !formData.partner || 
          !formData.transport_type || !formData.vehicle_type || !formData.price) {
        alert('Lütfen tüm zorunlu alanları doldurun:\n- Çıkış Lokasyonu\n- Varış Lokasyonu\n- Partner\n- Nakliye Tipi\n- Araç Tipi\n- Fiyat');
        return;
      }

      const cleanedData = {
        ...formData,
        price: formData.price === '' ? null : formData.price,
        weight: formData.weight === '' ? null : formData.weight,
        cbm: formData.cbm === '' ? null : formData.cbm,
        ldm: formData.ldm === '' ? null : formData.ldm,
        valid_until: formData.valid_until === '' ? null : formData.valid_until,
      };

      if (editingPrice) {
        const { error } = await supabase
          .from('prices')
          .update(cleanedData)
          .eq('id', editingPrice.id);

        if (error) {
          console.error('Güncelleme hatası:', error);
          alert('Fiyat güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
          return;
        }
        alert('Fiyat başarıyla güncellendi!');
      } else {
        const { error } = await supabase
          .from('prices')
          .insert([cleanedData]);

        if (error) {
          console.error('Ekleme hatası:', error);
          alert('Fiyat eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
          return;
        }
        alert('Fiyat başarıyla eklendi!');
      }

      resetForm();
      await refreshPrices();
    };

    const startEditPrice = (price) => {
      setFormData(price);
      setEditingPrice(price);
      setShowForm(true);
    };

    const deletePrice = async (id) => {
      const { error } = await supabase
        .from('prices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Silme hatası:', error);
        alert('Fiyat silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      alert('Fiyat başarıyla silindi!');
      await refreshPrices();
    };

    const parseCSV = (text) => {
      text = text.replace(/^\uFEFF/, '');
      
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) return [];

      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]);
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }

      return rows;
    };

    const validateAndConvertCSVRow = (row) => {
      const errors = [];
      
      if (!row.departure_city) errors.push('Çıkış şehri eksik');
      if (!row.arrival_city) errors.push('Varış şehri eksik');
      if (!row.transport_type) errors.push('Nakliye tipi eksik');
      if (!row.vehicle_type) errors.push('Araç tipi eksik');
      if (!row.company_name) errors.push('Firma adı eksik');
      if (!row.price) errors.push('Fiyat eksik');

      const parseNumber = (value) => {
        if (!value || value.trim() === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? undefined : num;
      };

      const parseDate = (dateStr) => {
        if (!dateStr || dateStr.trim() === '') return null;
        
        const formats = [
          /^(\d{2})\/(\d{2})\/(\d{4})$/,
          /^(\d{4})-(\d{2})-(\d{2})$/
        ];
        
        for (let format of formats) {
          const match = dateStr.trim().match(format);
          if (match) {
            if (format === formats[0]) {
              const [, day, month, year] = match;
              return `${year}-${month}-${day}`;
            } else {
              return dateStr.trim();
            }
          }
        }
        return undefined;
      };

      const price = parseNumber(row.price);
      if (row.price && price === undefined) errors.push('Fiyat geçersiz sayı');

      const weight = parseNumber(row.weight);
      if (row.weight && weight === undefined) errors.push('Ağırlık geçersiz sayı');

      const cbm = parseNumber(row.cbm);
      if (row.cbm && cbm === undefined) errors.push('CBM geçersiz sayı');

      const ldm = parseNumber(row.ldm);
      if (row.ldm && ldm === undefined) errors.push('LDM geçersiz sayı');

      const parseLength = parseNumber(row.length);
      const parseWidth = parseNumber(row.width);
      const parseHeight = parseNumber(row.height);
      
      if ((row.length && parseLength === undefined) || 
          (row.width && parseWidth === undefined) || 
          (row.height && parseHeight === undefined)) {
        errors.push('Boyut değerleri geçersiz');
      }

      const validUntil = parseDate(row.valid_until);
      if (row.valid_until && validUntil === undefined) {
        errors.push('Geçerlilik tarihi geçersiz format (DD/MM/YYYY veya YYYY-MM-DD kullanın)');
      }

      if (errors.length > 0) {
        return { success: false, errors };
      }

      const dimensions = parseLength || parseWidth || parseHeight
        ? `${parseLength || ''} x ${parseWidth || ''} x ${parseHeight || ''} (cm)`.replace(/\s+x\s+x\s+/, ' x ').trim()
        : '';

      return {
        success: true,
        data: {
          origin: row.departure_city.trim(),
          destination: row.arrival_city.trim(),
          partner: row.company_name.trim(),
          transport_type: row.transport_type.trim(),
          vehicle_type: row.vehicle_type.trim(),
          price: price,
          weight: weight,
          cbm: cbm,
          ldm: ldm,
          dimensions: dimensions || null,
          valid_until: validUntil,
          notes: row.notes?.trim() || null
        }
      };
    };

    const handleCsvImport = async () => {
      if (!csvFile) {
        alert('Lütfen bir CSV dosyası seçin.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          setImportProgress({ status: 'processing', message: 'CSV dosyası işleniyor...' });
          
          const text = e.target.result;
          const rows = parseCSV(text);
          
          if (rows.length === 0) {
            setImportProgress({ status: 'error', message: 'CSV dosyası boş veya geçersiz format.' });
            return;
          }

          const validRows = [];
          const invalidRows = [];

          rows.forEach((row, index) => {
            const result = validateAndConvertCSVRow(row);
            if (result.success) {
              validRows.push(result.data);
            } else {
              invalidRows.push({ row: index + 2, errors: result.errors });
            }
          });

          if (validRows.length === 0) {
            setImportProgress({ 
              status: 'error', 
              message: `Tüm satırlar geçersiz. ${invalidRows.length} hata bulundu.`,
              details: invalidRows 
            });
            return;
          }

          setImportProgress({ 
            status: 'importing', 
            message: `${validRows.length} kayıt veritabanına ekleniyor...` 
          });

          let successCount = 0;
          let failCount = 0;
          const dbErrors = [];

          for (let i = 0; i < validRows.length; i++) {
            try {
              const { error } = await supabase
                .from('prices')
                .insert([validRows[i]]);

              if (error) {
                failCount++;
                dbErrors.push({ row: i + invalidRows.length + 2, errors: [error.message] });
              } else {
                successCount++;
              }
            } catch (err) {
              failCount++;
              dbErrors.push({ row: i + invalidRows.length + 2, errors: [err.message] });
            }
          }

          await refreshPrices();
          
          const allErrors = [...invalidRows, ...dbErrors];
          setImportProgress({ 
            status: successCount > 0 ? 'success' : 'error', 
            message: `${successCount} fiyat başarıyla eklendi.${failCount > 0 ? ` ${failCount} kayıt eklenemedi.` : ''}${invalidRows.length > 0 ? ` ${invalidRows.length} satır format hatası nedeniyle atlandı.` : ''}`,
            successCount: successCount,
            errorCount: allErrors.length,
            errors: allErrors
          });

          setCsvFile(null);
          setTimeout(() => {
            setShowCsvImport(false);
            setImportProgress(null);
          }, 5000);

        } catch (error) {
          console.error('CSV işleme hatası:', error);
          setImportProgress({ 
            status: 'error', 
            message: 'CSV dosyası işlenirken hata oluştu: ' + error.message 
          });
        }
      };

      reader.readAsText(csvFile);
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'text/csv') {
        setCsvFile(file);
        setImportProgress(null);
      } else {
        alert('Lütfen geçerli bir CSV dosyası seçin.');
        e.target.value = '';
      }
    };

    const isExpired = (date) => {
      if (!date) return false;
      return new Date(date) < new Date();
    };

    const getFilteredPrices = () => {
      return prices.filter(price => {
        if (filters.origin && !price.origin?.toLowerCase().includes(filters.origin.toLowerCase())) return false;
        if (filters.destination && !price.destination?.toLowerCase().includes(filters.destination.toLowerCase())) return false;
        if (filters.partner && !price.partner?.toLowerCase().includes(filters.partner.toLowerCase())) return false;
        if (filters.transport_type && !price.transport_type?.toLowerCase().includes(filters.transport_type.toLowerCase())) return false;
        if (filters.vehicle_type && !price.vehicle_type?.toLowerCase().includes(filters.vehicle_type.toLowerCase())) return false;
        if (filters.price_min && parseFloat(price.price) < parseFloat(filters.price_min)) return false;
        if (filters.price_max && parseFloat(price.price) > parseFloat(filters.price_max)) return false;
        return true;
      });
    };

    const resetFilters = () => {
      setFilters({
        origin: '',
        destination: '',
        partner: '',
        transport_type: '',
        vehicle_type: '',
        price_min: '',
        price_max: ''
      });
      setCurrentPage(1);
    };

    const filteredPrices = getFilteredPrices();
    const itemsPerPage = 50;
    const totalPages = Math.ceil(filteredPrices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPrices = filteredPrices.slice(startIndex, endIndex);

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          pages.push(currentPage - 1);
          pages.push(currentPage);
          pages.push(currentPage + 1);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Fiyat Veritabanı</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowCsvImport(!showCsvImport)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Plus size={20} /> CSV İçe Aktar
            </button>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus size={20} /> Yeni Fiyat
            </button>
          </div>
        </div>

        {showCsvImport && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">CSV Dosyasından Toplu Fiyat İçe Aktarma</h3>
            
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-semibold mb-2">CSV Format Bilgisi:</p>
              <p className="text-xs text-blue-700 font-mono">
                departure_city,arrival_city,transport_type,vehicle_type,company_name,price,weight,created_at,valid_until,cbm,ldm,length,height,width,notes
              </p>
              <p className="text-xs text-blue-600 mt-2">
                * Zorunlu alanlar: departure_city, arrival_city, transport_type, vehicle_type, company_name, price
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV Dosyası Seç
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {csvFile && (
                <p className="text-sm text-green-600 mt-2">
                  Seçilen dosya: {csvFile.name}
                </p>
              )}
            </div>

            {importProgress && (
              <div className={`mb-4 p-4 rounded-lg ${
                importProgress.status === 'success' ? 'bg-green-50 border border-green-200' :
                importProgress.status === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className={`text-sm font-semibold ${
                  importProgress.status === 'success' ? 'text-green-800' :
                  importProgress.status === 'error' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>
                  {importProgress.message}
                </p>
                {importProgress.errors && importProgress.errors.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <p className="text-xs text-red-700 font-semibold">Hatalı Satırlar:</p>
                    {importProgress.errors.slice(0, 10).map((err, idx) => (
                      <p key={idx} className="text-xs text-red-600">
                        Satır {err.row}: {err.errors.join(', ')}
                      </p>
                    ))}
                    {importProgress.errors.length > 10 && (
                      <p className="text-xs text-red-600 mt-1">
                        ... ve {importProgress.errors.length - 10} hata daha
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={handleCsvImport} 
                disabled={!csvFile || importProgress?.status === 'importing'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {importProgress?.status === 'importing' ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
              </button>
              <button 
                onClick={() => {
                  setShowCsvImport(false);
                  setCsvFile(null);
                  setImportProgress(null);
                }} 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">{editingPrice ? 'Fiyat Düzenle' : 'Yeni Fiyat'}</h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <select
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Çıkış Lokasyonu *</option>
                {originLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>

              <select
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Varış Lokasyonu *</option>
                {destinationLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>

              <select
                value={formData.partner}
                onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Partner Seç *</option>
                {partners.map(p => (
                  <option key={p.id} value={p.company_name}>{p.company_name}</option>
                ))}
              </select>

              <select
                value={formData.transport_type}
                onChange={(e) => setFormData({ ...formData, transport_type: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Nakliye Tipi *</option>
                {transportTypes.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>

              <select
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Araç Tipi *</option>
                {vehicleTypes.map(v => (
                  <option key={v.id} value={v.name}>{v.name}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Fiyat (€) *"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                required
              />

              <input
                type="number"
                placeholder="Ağırlık (kg)"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />

              <input
                type="number"
                placeholder="CBM"
                value={formData.cbm}
                onChange={(e) => setFormData({ ...formData, cbm: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />

              <input
                type="number"
                placeholder="LDM"
                value={formData.ldm}
                onChange={(e) => setFormData({ ...formData, ldm: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />

              <input
                type="text"
                placeholder="L x W x H (cm)"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />

              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />

              <textarea
                placeholder="Notlar"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="px-4 py-2 border rounded-lg col-span-3"
                rows="2"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={handleSubmitPrice} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Kaydet
              </button>
              <button onClick={resetForm} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                İptal
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filtrele</h3>
          <div className="grid grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Çıkış Lokasyonu"
              value={filters.origin}
              onChange={(e) => {
                setFilters({ ...filters, origin: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Varış Lokasyonu"
              value={filters.destination}
              onChange={(e) => {
                setFilters({ ...filters, destination: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Partner"
              value={filters.partner}
              onChange={(e) => {
                setFilters({ ...filters, partner: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Nakliye Tipi"
              value={filters.transport_type}
              onChange={(e) => {
                setFilters({ ...filters, transport_type: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Araç Tipi"
              value={filters.vehicle_type}
              onChange={(e) => {
                setFilters({ ...filters, vehicle_type: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Min Fiyat (€)"
              value={filters.price_min}
              onChange={(e) => {
                setFilters({ ...filters, price_min: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Max Fiyat (€)"
              value={filters.price_max}
              onChange={(e) => {
                setFilters({ ...filters, price_max: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
            >
              Filtreleri Sıfırla
            </button>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Toplam {filteredPrices.length} fiyat bulundu {filteredPrices.length !== prices.length && `(${prices.length} kayıt içinden)`}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Güzergah</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Partner</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nakliye/Araç</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fiyat</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Detaylar</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Geçerlilik</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPrices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    {filters.origin || filters.destination || filters.partner || filters.transport_type || filters.vehicle_type || filters.price_min || filters.price_max
                      ? 'Filtrelere uygun fiyat bulunamadı.'
                      : 'Henüz fiyat kaydı yok.'}
                  </td>
                </tr>
              ) : (
                currentPrices.map(price => (
                  <tr key={price.id} className={isExpired(price.valid_until) ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3">
                      <div className="text-sm">{price.origin} → {price.destination}</div>
                    </td>
                    <td className="px-4 py-3">{price.partner}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{price.transport_type}</div>
                      <div className="text-xs text-gray-500">{price.vehicle_type}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{price.price} €</td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        {price.weight && <div>Ağırlık: {price.weight} kg</div>}
                        {price.cbm && <div>CBM: {price.cbm}</div>}
                        {price.ldm && <div>LDM: {price.ldm}</div>}
                        {price.dimensions && <div>Boyut: {price.dimensions}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm ${isExpired(price.valid_until) ? 'text-red-600 font-semibold' : ''}`}>
                        {price.valid_until || 'Belirtilmemiş'}
                        {isExpired(price.valid_until) && <div className="text-xs">Süresi doldu</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEditPrice(price)} className="text-blue-600 hover:text-blue-800 mr-3">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => confirmDelete(() => deletePrice(price.id))} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Sayfa {currentPage} / {totalPages} - Gösterilen: {startIndex + 1}-{Math.min(endIndex, filteredPrices.length)} / {filteredPrices.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Önceki
                </button>
                
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`dots-${index}`} className="px-3 py-1 text-gray-500">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 border rounded-lg text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    const totalRequests = projects.length;
    const totalPartners = partners.length;
    const openProjects = projects.filter(p => p.status === 'yeni' || p.status === 'fiyatlandırma').length;
    const expiredPrices = prices.filter(p => p.valid_until && new Date(p.valid_until) < new Date()).length;

    const projectsByStatus = {
      yeni: projects.filter(p => p.status === 'yeni').length,
      fiyatlandırma: projects.filter(p => p.status === 'fiyatlandırma').length,
      kazanıldı: projects.filter(p => p.status === 'kazanıldı').length,
      kaybedildi: projects.filter(p => p.status === 'kaybedildi').length
    };

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Package size={32} />
              <span className="text-3xl font-bold">{totalRequests}</span>
            </div>
            <div className="text-sm opacity-90">Toplam Talepler</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users size={32} />
              <span className="text-3xl font-bold">{totalPartners}</span>
            </div>
            <div className="text-sm opacity-90">Tanımlı Partnerler</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex(items-center) justify-between mb-2">
              <TrendingUp size={32} />
              <span className="text-3xl font-bold">{openProjects}</span>
            </div>
            <div className="text-sm opacity-90">Açık Projeler</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle size={32} />
              <span className="text-3xl font-bold">{expiredPrices}</span>
            </div>
            <div className="text-sm opacity-90">Tarihi Geçen Fiyatlar</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Proje Durumları</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{projectsByStatus.yeni}</div>
              <div className="text-sm text-gray-600">Yeni</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{projectsByStatus.fiyatlandırma}</div>
              <div className="text-sm text-yellow-600">Fiyatlandırma</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{projectsByStatus.kazanıldı}</div>
              <div className="text-sm text-green-600">Kazanıldı</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{projectsByStatus.kaybedildi}</div>
              <div className="text-sm text-red-600">Kaybedildi</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Yükleniyor…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Freight Forwarder Yönetim Sistemi</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('master')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'master' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Temel Tanımlar
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'partners' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Partnerler
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'customers' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Müşteriler
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'projects' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Projeler
            </button>
            <button
              onClick={() => setActiveTab('prices')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'prices' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Fiyat Veritabanı
            </button>
          </div>
        </div>
      </nav>

      <main>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'master' && <MasterData />}
        {activeTab === 'partners' && <Partners />}
        {activeTab === 'customers' && <Customers />}
        {activeTab === 'projects' && <Projects />}
        {activeTab === 'prices' && <PriceDatabase />}
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Silme Onayı</h3>
            <p className="mb-6">Bu öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                İptal
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreightForwarderApp;
