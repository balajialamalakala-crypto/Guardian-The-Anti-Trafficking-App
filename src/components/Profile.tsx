import React, { useState, useEffect } from 'react';
import { User, Phone, Plus, Trash2, Save, ShieldCheck, Mail, UserCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SOSContact } from '../types';
import { useFirebase } from '../App';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export default function Profile() {
  const { user, profile, logout } = useFirebase();
  const [contacts, setContacts] = useState<SOSContact[]>(profile?.sosContacts || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.sosContacts) {
      setContacts(profile.sosContacts);
    }
  }, [profile]);

  const saveContacts = async (updatedContacts: SOSContact[]) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { sosContacts: updatedContacts });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddContact = async () => {
    if (newContact.name && newContact.phone) {
      const updated = [...contacts, { ...newContact, id: Date.now().toString() }];
      setContacts(updated);
      await saveContacts(updated);
      setNewContact({ name: '', phone: '', email: '' });
      setIsAdding(false);
    }
  };

  const handleRemoveContact = async (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    await saveContacts(updated);
  };

  return (
    <div className="space-y-8">
      {/* User Info */}
      <section className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200 border border-zinc-100 flex flex-col items-center text-center gap-4 relative">
        <button 
          onClick={logout}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
        
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <UserCircle size={64} strokeWidth={1.5} />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">{profile?.displayName || user?.displayName}</h2>
          <p className="text-sm text-zinc-500">{profile?.email || user?.email}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100">
          <ShieldCheck size={14} />
          {profile?.role === 'admin' ? 'Admin Account' : 'Verified Account'}
        </div>
      </section>

      {/* SOS Contacts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg">
              <Phone size={16} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">SOS Contacts</h3>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
          >
            <Plus size={12} />
            Add New
          </button>
        </div>

        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-50 text-zinc-400 rounded-2xl flex items-center justify-center border border-zinc-100">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">{contact.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                        <Phone size={10} /> {contact.phone}
                      </span>
                      {contact.email && (
                        <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                          <Mail size={10} /> {contact.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveContact(contact.id)}
                  className="p-2 text-zinc-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-50 p-6 rounded-3xl border-2 border-dashed border-zinc-200 space-y-4"
            >
              <div className="grid gap-3">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddContact}
                  disabled={isSaving}
                  className="flex-1 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} />
                  {isSaving ? 'Saving...' : 'Save Contact'}
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-white text-zinc-500 border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* App Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <div className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg">
            <ShieldCheck size={16} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Safety Settings</h3>
        </div>
        
        <div className="bg-white rounded-3xl border border-zinc-200 divide-y divide-zinc-100">
          <div className="p-5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Discreet Mode</h4>
              <p className="text-[10px] text-zinc-500">Quickly hide app content with a gesture.</p>
            </div>
            <div className="w-10 h-5 bg-zinc-200 rounded-full relative">
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Location Sharing</h4>
              <p className="text-[10px] text-zinc-500">Always share location with SOS contacts.</p>
            </div>
            <div className="w-10 h-5 bg-emerald-600 rounded-full relative">
              <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
