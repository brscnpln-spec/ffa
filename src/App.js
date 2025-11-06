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

      const [vTypes, tTypes, origins, destinations, partnersData, projectsData, pricesData] = await Promise.all([
        supabase.from('vehicle_types').select('*'),
        supabase.from('transport_types').select('*'),
        supabase.from('origin_locations').select('*'),
        supabase.from('destination_locations').select('*'),
        supabase.from('partners').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('prices').select('*')
      ]);

      setVehicleTypes(vTypes.data || []);
      setTransportTypes(tTypes.data || []);
      setOriginLocations(origins.data || []);
      setDestinationLocations(destinations.data || []);
      setPartners(partnersData.data || []);
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
        alert('Ekleme hatası: ' + error.message);
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
        alert('Güncelleme hatası: ' + error.message);
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
        alert('Silme hatası: ' + error.message);
        return;
      }

      await refreshData();
    };

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Temel Tanımlar</h2>

        <div className="mb-6">
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="vehicle">Araç Tipi</option>
            <option value="transport">Nakliye Tipi</option>
            <option value="origin">Çıkış Lokasyonu</option>
            <option value="destination">Varış Lokasyonu</option>
          </select>
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
          alert('Güncelleme hatası: ' + error.message);
          return;
        }
      } else {
        const { error } = await supabase
          .from('partners')
          .insert([formData]);

        if (error) {
          alert('Ekleme hatası: ' + error.message);
          return;
        }
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
        alert('Silme hatası: ' + error.message);
        return;
      }

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
          alert('Güncelleme hatası: ' + error.message);
          return;
        }
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([{ ...formData, project_id: generateProjectId() }]);

        if (error) {
          alert('Ekleme hatası: ' + error.message);
          return;
        }
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
        alert('Silme hatası: ' + error.message);
        return;
      }

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
        alert('Fiyat güncelleme hatası: ' + error.message);
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

  // Price Database Component
  const PriceDatabase = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);
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
          alert('Güncelleme hatası: ' + error.message);
          return;
        }
      } else {
        const { error } = await supabase
          .from('prices')
          .insert([cleanedData]);

        if (error) {
          alert('Ekleme hatası: ' + error.message);
          return;
        }
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
        alert('Silme hatası: ' + error.message);
        return;
      }

      await refreshPrices();
    };

    const isExpired = (date) => {
      if (!date) return false;
      return new Date(date) < new Date();
    };

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Fiyat Veritabanı</h2>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} /> Yeni Fiyat
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">{editingPrice ? 'Fiyat Düzenle' : 'Yeni Fiyat'}</h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <select
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Çıkış Lokasyonu</option>
                {originLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>

              <select
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="px-4 py-2:border rounded-lg"
              >
                <option value="">Varış Lokasyonu</option>
                {destinationLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>

              <select
                value={formData.partner}
                onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Partner Seç</option>
                {partners.map(p => (
                  <option key={p.id} value={p.company_name}>{p.company_name}</option>
                ))}
              </select>

              <select
                value={formData.transport_type}
                onChange={(e) => setFormData({ ...formData, transport_type: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Nakliye Tipi</option>
                {transportTypes.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>

              <select
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Araç Tipi</option>
                {vehicleTypes.map(v => (
                  <option key={v.id} value={v.name}>{v.name}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Fiyat (€)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="px-4 py-2 border rounded-lg"
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
              {prices.map(price => (
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
              ))}
            </tbody>
          </table>
        </div>
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
