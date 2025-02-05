import React, { useState } from 'react';
import { Search, Phone, Mail, MapPin } from 'lucide-react';

const ContactsDisplay = () => {
  const contacts = [
    {
      id: 1,
      name: 'Dr. Lakshmi Kant Mishra',
      role: 'Member, DDPC, CED [31-07-2019 till date]',
      phone: '5322271312(O) 5322271701(R) 9936415588(M)',
      email: 'lkm@mnnit.ac.in',
      department: 'Department of Civil Engineering',
      avatar: 'src/assets/images/Dr.LKMishra.jpg'
    },
  ];

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          MNNIT Contacts Directory
        </h1>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 rounded-lg border border-slate-700 transition-all"
          />
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map(contact => (
            <div
              key={contact.id}
              className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-10 border border-slate-700 hover:border-purple-500 transition-all"
            >
              <div className="flex flex-col items-center gap-4 mb-6">
                <img
                  src={contact.avatar}
                  className="w-32 h-32 rounded bg-purple-500/20"
                />
                <div className="text-center">
                  <h3 className="text-2xl font-semibold">{contact.name}</h3>
                  <p className="text-purple-400 text-l">{contact.role}</p>
                </div>
              </div>

              <div className="space-y-4 text-slate-300">
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-slate-400" />
                  <span className="text-l">{contact.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-slate-400" />
                  <span className="text-l">{contact.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-slate-400" />
                  <span className="text-l">{contact.department}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactsDisplay;