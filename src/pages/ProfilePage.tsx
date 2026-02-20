import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Building2, Phone, MapPin, Save, X } from 'lucide-react';

interface ProfilePageProps {
  onClose: () => void;
}

const ProfilePage = ({ onClose }: ProfilePageProps) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
    phone: '+91 98765 43210',
    location: 'Chennai, India',
    department: 'Operations',
    title: user?.role === 'kam' ? 'Key Account Manager' : 'Aviation Asset Manager',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Field = ({ label, value, field, editable = true, icon: Icon }: {
    label: string; value: string; field?: keyof typeof form; editable?: boolean; icon?: any;
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-body text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3 glass-card px-4 py-3 rounded-xl">
        {Icon && <Icon className="w-4 h-4 text-primary flex-shrink-0" />}
        {editing && editable && field ? (
          <input
            className="flex-1 bg-transparent text-sm font-body text-foreground outline-none"
            value={form[field]}
            onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
          />
        ) : (
          <span className={`flex-1 text-sm font-body ${!editable ? 'text-muted-foreground' : 'text-foreground'}`}>{value}</span>
        )}
        {!editable && <span className="text-[10px] font-body text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Read-only</span>}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-50 flex"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        exit={{ x: -400 }}
        transition={{ type: 'spring', damping: 28 }}
        className="relative z-10 w-full max-w-md h-full glass-card-glow flex flex-col overflow-hidden"
        style={{ background: 'rgba(10, 12, 22, 0.92)', backdropFilter: 'blur(32px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/08">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-heading text-base font-bold text-foreground">My Profile</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center py-8 border-b border-white/06">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 flex items-center justify-center mb-3 ring-2 ring-primary/30">
            <span className="font-heading text-2xl font-bold text-primary">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <p className="font-heading text-base font-bold text-foreground">{form.name}</p>
          <p className="text-xs font-body text-muted-foreground mt-0.5">{form.title}</p>
          <span className="mt-2 px-3 py-1 rounded-full text-xs font-heading font-semibold bg-primary/15 text-primary border border-primary/20">
            {user?.role === 'kam' ? 'Key Account Manager' : 'Client'}
          </span>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Field label="Full Name" value={form.name} field="name" icon={User} />
          <Field label="Email Address" value={user?.email || ''} editable={false} icon={Mail} />
          {user?.company && <Field label="Company" value={form.company} field="company" icon={Building2} />}
          <Field label="Phone" value={form.phone} field="phone" icon={Phone} />
          <Field label="Location" value={form.location} field="location" icon={MapPin} />
          <Field label="Department" value={form.department} field="department" />
          <Field label="Job Title" value={form.title} field="title" />
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/06 flex gap-3">
          {editing ? (
            <>
              <button onClick={handleSave} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2 text-sm rounded-xl">
                <Save className="w-4 h-4" /> Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary px-4 py-2.5 text-sm rounded-xl">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-primary flex-1 py-2.5 text-sm rounded-xl">
              Edit Profile
            </button>
          )}
        </div>
        {saved && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-success/90 text-white text-xs font-heading font-semibold px-4 py-2 rounded-full">
            Profile saved!
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;
